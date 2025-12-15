require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Pool de conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'collservice',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Crear directorio uploads si no existe
const uploadDir = 'uploads/empleadas';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const cedula = req.body.cedula || 'sin-cedula';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${cedula}-${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, JPG, JPEG o PNG'));
    }
  }
});

// Middleware para servir archivos subidos
app.use('/uploads', express.static('uploads'));

// Ruta de prueba
app.get('/api/ping', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ ok: true, db: rows[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==========================
// REGISTRO DE EMPLEADA (CON TODOS LOS CAMPOS)
// ==========================
app.post('/api/empleadas/registro', upload.fields([
  { name: 'antecedentes_penales', maxCount: 1 },
  { name: 'antecedentes_judiciales', maxCount: 1 }
]), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      nombre,
      apellido,
      cedula,
      fecha_nacimiento,  // ✅ Ahora SÍ existe en la tabla
      correo,
      telefono,
      direccion,
      experiencia,
      disponibilidad,
      contrasena,
      confirmarContrasena,
      aceptar_terminos,
      fecha_registro     // ✅ Ahora SÍ existe en la tabla
    } = req.body;

    console.log('📥 Datos recibidos para empleada:', {
      nombre, apellido, cedula, correo, telefono
    });

    // Validaciones básicas
    if (!nombre || !apellido || !cedula || !correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios: nombre, apellido, cédula, correo o contraseña' 
      });
    }

    // Validar que las contraseñas coincidan
    if (contrasena !== confirmarContrasena) {
      return res.status(400).json({ 
        error: 'Las contraseñas no coinciden' 
      });
    }

    // Validar términos y condiciones
    if (!aceptar_terminos || aceptar_terminos === 'false') {
      return res.status(400).json({ 
        error: 'Debe aceptar los términos y condiciones' 
      });
    }

    // Validar formato de cédula
    if (!/^[0-9]{6,12}$/.test(cedula)) {
      return res.status(400).json({ 
        error: 'La cédula debe tener entre 6 y 12 dígitos' 
      });
    }

    // Validar formato de correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ 
        error: 'Formato de correo electrónico inválido' 
      });
    }

    // Validar teléfono
    if (telefono && !/^[0-9]{7,15}$/.test(telefono)) {
      return res.status(400).json({ 
        error: 'El teléfono debe tener entre 7 y 15 dígitos' 
      });
    }

    // Validar fecha de nacimiento (si se proporciona)
    if (fecha_nacimiento) {
      const fechaNac = new Date(fecha_nacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      
      if (edad < 18) {
        return res.status(400).json({ 
          error: 'La empleada debe ser mayor de edad' 
        });
      }
    }

    // Verificar duplicados
    const [existingCedula] = await connection.query(
      'SELECT documento_empleado FROM empleado WHERE documento_empleado = ?',
      [cedula]
    );
    
    if (existingCedula.length > 0) {
      return res.status(409).json({ error: 'La cédula ya está registrada' });
    }

    const [existingEmail] = await connection.query(
      'SELECT correo_empleado FROM empleado WHERE correo_empleado = ?',
      [correo]
    );
    
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Validar que se hayan subido los archivos
    if (!req.files?.antecedentes_penales) {
      return res.status(400).json({ 
        error: 'Debe adjuntar el certificado de antecedentes penales' 
      });
    }

    if (!req.files?.antecedentes_judiciales) {
      return res.status(400).json({ 
        error: 'Debe adjuntar el certificado de antecedentes judiciales' 
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // INSERTAR CON TODOS LOS CAMPOS (13 campos)
    const sql = `
      INSERT INTO empleado (
        documento_empleado,      -- 1. cedula
        nombre_empleado,         -- 2. nombre
        apellido_empleado,       -- 3. apellido
        correo_empleado,         -- 4. correo
        contrasena_empleado,     -- 5. contrasena (hasheada)
        telefono_empleado,       -- 6. telefono
        direccion_empleado,      -- 7. direccion
        perfil_laboral,          -- 8. valor fijo
        experiencia_laboral,     -- 9. experiencia
        servicios_realizados,    -- 10. valor fijo
        disponibilidad,          -- 11. disponibilidad
        fecha_nacimiento,        -- 12. fecha_nacimiento (NUEVO)
        fecha_registro           -- 13. fecha_registro (NUEVO)
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      cedula,                    // 1. documento_empleado
      nombre,                   // 2. nombre_empleado
      apellido,                 // 3. apellido_empleado
      correo,                   // 4. correo_empleado
      hashedPassword,           // 5. contrasena_empleado
      telefono || null,         // 6. telefono_empleado
      direccion || null,        // 7. direccion_empleado
      'Empleada doméstica',     // 8. perfil_laboral
      experiencia || 'Sin experiencia especificada', // 9. experiencia_laboral
      'Ninguno',                // 10. servicios_realizados
      disponibilidad || 'Disponibilidad no especificada', // 11. disponibilidad
      fecha_nacimiento || null, // 12. fecha_nacimiento (puede ser NULL)
      fecha_registro || new Date().toISOString().split('T')[0] // 13. fecha_registro
    ];

    console.log('📤 Insertando empleada con 13 campos:', valores);

    await connection.execute(sql, valores);
    await connection.commit();

    return res.json({ 
      mensaje: '✅ Empleada registrada con éxito',
      success: true,
      empleada: {
        nombre: nombre,
        apellido: apellido,
        cedula: cedula,
        correo: correo,
        telefono: telefono,
        fecha_nacimiento: fecha_nacimiento || 'No especificada',
        fecha_registro: fecha_registro || new Date().toISOString().split('T')[0]
      }
    });
    
  } catch (err) {
    await connection.rollback();
    
    // Eliminar archivos si hubo error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          const filePath = path.join(uploadDir, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      });
    }
    
    console.error('❌ ERROR en registro de empleada:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El registro ya existe en la base de datos' });
    }
    
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        error: 'Error: Falta alguna columna en la tabla. Ejecuta: ALTER TABLE empleado ADD COLUMN fecha_nacimiento DATE, ADD COLUMN fecha_registro DATE DEFAULT CURRENT_DATE;' 
      });
    }
    
    if (err.message && err.message.includes('Solo se permiten archivos')) {
      return res.status(400).json({ error: err.message });
    }
    
    return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
  } finally {
    connection.release();
  }
});

// ==========================
// REGISTRO DE ADMINISTRADOR 
// ==========================
app.post('/api/administradores/registro', async (req, res) => {
  try {
    const { 
      usuario_admin,
      nombre,
      apellido,
      correo,
      telefono,
      direccion,
      cargo,
      area,
      contrasena,
      fecha_registro
    } = req.body;

    console.log('📥 Datos recibidos:', req.body);

    // Validar campos obligatorios
    const camposObligatorios = ['usuario_admin', 'nombre', 'correo', 'contrasena', 'cargo', 'area'];
    const faltan = camposObligatorios.filter(campo => {
      const valor = req.body[campo];
      return !valor || valor.toString().trim() === '';
    });
    
    if (faltan.length > 0) {
      return res.status(400).json({ 
        error: `Faltan campos obligatorios: ${faltan.join(', ')}` 
      });
    }

    // Validaciones específicas
    if (!/^[a-zA-Z0-9]+$/.test(usuario_admin)) {
      return res.status(400).json({ 
        error: 'El usuario solo puede contener letras y números' 
      });
    }

    if (!/\S+@\S+\.\S+/.test(correo)) {
      return res.status(400).json({ 
        error: 'Formato de correo electrónico inválido' 
      });
    }

    if (contrasena.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar duplicados
    const [existingUser] = await pool.query(
      'SELECT documento_admin FROM administrador WHERE documento_admin = ?',
      [usuario_admin]
    );
    
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'El usuario ya está registrado' });
    }

    const [existingEmail] = await pool.query(
      'SELECT correo_admin FROM administrador WHERE correo_admin = ?',
      [correo]
    );
    
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear contraseña
    const hashed = await bcrypt.hash(contrasena, 10);

    // Preparar valores
    const fechaRegistroValida = fecha_registro && fecha_registro.trim() !== '' 
      ? fecha_registro 
      : new Date().toISOString().split('T')[0];

    const valores = [
      usuario_admin,
      nombre,
      apellido && apellido.trim() !== '' ? apellido : null,
      telefono && telefono.trim() !== '' ? telefono : null,
      direccion && direccion.trim() !== '' ? direccion : null,
      correo,
      hashed,
      cargo,
      area,
      fechaRegistroValida
    ];

    console.log('📤 Valores a insertar:', valores);

    // Insertar en la base de datos
    const sql = `
      INSERT INTO administrador (
        documento_admin,
        nombre_admin,
        apellido_admin,
        telefono_admin,
        direccion_admin,
        correo_admin,
        contraseña_admin,
        cargo,
        area,
        fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, valores);

    return res.json({ 
      mensaje: '✅ Administrador registrado con éxito',
      success: true,
      usuario: usuario_admin,
      nombre: nombre,
      cargo: cargo
    });
    
  } catch (err) {
    console.error('❌ ERROR:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El registro ya existe en la base de datos' });
    }
    
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ error: 'Error en la estructura de la base de datos' });
    }
    
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================
// Registro de Cliente
// ==========================
app.post('/api/clientes/registro', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      tipo_cliente,
      tipo_documento,
      documento_cliente,
      nombre_cliente,
      apellido_cliente,
      direccion_cliente,
      telefono_cliente,
      correo_cliente,
      contrasena,
      historial_servicios,
      razon_social,
      nit_empresa,
      representante_legal,
      correo_empresa,
      telefono_empresa,
      fecha_registro
    } = req.body;

    if (!tipo_cliente) {
      throw { 
        status: 400, 
        message: 'Seleccione el tipo de cliente (Persona o Empresa).' 
      };
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    // PERSONA NATURAL
    if (tipo_cliente === "Persona") {
      if (!documento_cliente || !nombre_cliente || !correo_cliente || !contrasena) {
        throw { 
          status: 400, 
          message: 'Para Persona Natural, complete: documento, nombre, correo y contraseña.' 
        };
      }

      const tiposValidos = ['CC', 'CE', 'PA', 'TI'];
      if (tipo_documento && !tiposValidos.includes(tipo_documento)) {
        throw { 
          status: 400, 
          message: 'Tipo de documento no válido. Use: CC, CE, PA o TI.' 
        };
      }

      const [existingDoc] = await connection.query(
        'SELECT documento_cliente FROM cliente WHERE documento_cliente = ?',
        [documento_cliente]
      );
      
      if (existingDoc.length > 0) {
        throw { status: 409, message: 'El documento ya está registrado' };
      }

      const [existingEmail] = await connection.query(
        'SELECT correo_cliente FROM cliente WHERE correo_cliente = ?',
        [correo_cliente]
      );
      
      if (existingEmail.length > 0) {
        throw { status: 409, message: 'El correo ya está registrado' };
      }

      const sqlCliente = `
        INSERT INTO cliente (
          documento_cliente,
          tipo_doc_cliente,
          nombre_cliente,
          apellido_cliente,
          direccion_cliente,
          telefono_cliente,
          correo_cliente,
          contrasena,
          historial_servicios
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(sqlCliente, [
        documento_cliente,
        tipo_documento || null,
        nombre_cliente,
        apellido_cliente || null,
        direccion_cliente || null,
        telefono_cliente || null,
        correo_cliente,
        hashed,
        historial_servicios || null
      ]);

      await connection.commit();
      return res.json({ 
        mensaje: '✅ Persona Natural registrada con éxito',
        tipo: 'persona',
        success: true
      });
    }

    // EMPRESA
    else if (tipo_cliente === "Empresa") {
      if (!razon_social || !nit_empresa || !correo_empresa || !contrasena) {
        throw { 
          status: 400, 
          message: 'Para Empresa, complete: razón social, NIT, correo empresarial y contraseña.' 
        };
      }

      const [existingNIT] = await connection.query(
        'SELECT nlt FROM empresa WHERE nlt = ?',
        [nit_empresa]
      );
      
      if (existingNIT.length > 0) {
        throw { status: 409, message: 'El NIT ya está registrado' };
      }

      const [existingEmail] = await connection.query(
        'SELECT correo_empresa FROM empresa WHERE correo_empresa = ?',
        [correo_empresa]
      );
      
      if (existingEmail.length > 0) {
        throw { status: 409, message: 'El correo empresarial ya está registrado' };
      }

      const sqlEmpresa = `
        INSERT INTO empresa (
          razon_social,
          nlt,
          representante_legal,
          direccion,
          telefono_empresa,
          correo_empresa,
          contrasena,
          fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(sqlEmpresa, [
        razon_social,
        nit_empresa,
        representante_legal || null,
        direccion_cliente || null,
        telefono_empresa || null,
        correo_empresa,
        hashed,
        fecha_registro || new Date().toISOString().split('T')[0]
      ]);

      await connection.commit();
      return res.json({ 
        mensaje: '✅ Empresa registrada con éxito',
        tipo: 'empresa',
        success: true
      });
    }
    else {
      throw { 
        status: 400, 
        message: 'Tipo de cliente no válido. Use: "Persona" o "Empresa".' 
      };
    }
    
  } catch (err) {
    await connection.rollback();
    connection.release();
    
    console.error('ERROR en /api/clientes/registro:', err);
    
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El registro ya existe en la base de datos' });
    }
    
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        error: 'Error en la estructura de la base de datos' 
      });
    }
    
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================
// Login 
// ==========================
app.post('/api/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    // Buscar en Administradores
    let [rows] = await pool.query(
      "SELECT documento_admin as id, correo_admin AS correo, contraseña_admin AS password, 'admin' AS rol, nombre_admin as nombre FROM administrador WHERE correo_admin = ?", 
      [correo]
    );
    
    // Buscar en Empleados
    if (rows.length === 0) {
      [rows] = await pool.query(
        "SELECT documento_empleado as id, correo_empleado AS correo, contrasena_empleado AS password, 'empleado' AS rol, nombre_empleado as nombre FROM empleado WHERE correo_empleado = ?", 
        [correo]
      );
    }

    // Buscar en Clientes
    if (rows.length === 0) {
      [rows] = await pool.query(
        "SELECT documento_cliente as id, correo_cliente AS correo, contrasena AS password, 'cliente' AS rol, nombre_cliente as nombre FROM cliente WHERE correo_cliente = ?", 
        [correo]
      );
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = rows[0];
    const match = await bcrypt.compare(contrasena, usuario.password);
    
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    delete usuario.password;
    
    res.json({ 
      mensaje: "✅ Login exitoso", 
      rol: usuario.rol,
      usuario: usuario
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================
// Listar Administradores
// ==========================
app.get('/api/administradores', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT documento_admin, nombre_admin, apellido_admin, correo_admin, cargo, area, fecha_registro FROM administrador ORDER BY fecha_registro DESC'
    );
    
    res.json({
      success: true,
      total: rows.length,
      administradores: rows
    });
  } catch (err) {
    console.error('Error obteniendo administradores:', err);
    res.status(500).json({ error: 'Error al obtener administradores' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📁 Ruta para archivos: http://localhost:${PORT}/uploads/`);
});