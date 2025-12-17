require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================
// CONFIGURACIÓN GMAIL REAL
// ==========================
console.log('\n🔧 VERIFICANDO CONFIGURACIÓN EMAIL:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADO');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'CONFIGURADO' : 'NO CONFIGURADO');

let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Verificar conexión email
    transporter.verify(function(error, success) {
        if (error) {
            console.error('❌ ERROR CONEXIÓN EMAIL:', error.message);
            console.error('🔧 Solución:');
            console.error('1. Verifica EMAIL_USER y EMAIL_PASSWORD en .env');
            console.error('2. Usa contraseña de aplicación de Google (16 caracteres con espacios)');
            console.error('3. Asegúrate de tener Verificación en 2 pasos ACTIVADA');
        } else {
            console.log('✅ CONEXIÓN EMAIL EXITOSA!');
            console.log('📧 Enviando desde:', process.env.EMAIL_USER);
        }
    });
} else {
    console.log('⚠️  MODO PRUEBA: No hay configuración de email, usando consola');
}

// ==========================
// CONFIGURACIÓN BASE DE DATOS
// ==========================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'collservice',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    port: process.env.DB_PORT || 3306
});

// ==========================
// VERIFICAR TABLAS DE VERIFICACIÓN
// ==========================
async function checkVerificationTables() {
    try {
        console.log('\n🔍 VERIFICANDO TABLAS DE VERIFICACIÓN...');
        
        // Verificar tabla email_verifications
        const [tableExists] = await pool.query(`
            SHOW TABLES LIKE 'email_verifications'
        `);
        
        if (tableExists.length === 0) {
            console.error('❌ ERROR CRÍTICO: Tabla email_verifications NO EXISTE');
            console.error('💡 Ejecuta manualmente en phpMyAdmin los comandos SQL');
            process.exit(1);
        }
        
        console.log('✅ Tabla email_verifications existe');
        
        // Verificar columnas en tablas de usuarios
        const tablesToCheck = ['administrador', 'empleado', 'cliente', 'empresa'];
        
        for (const table of tablesToCheck) {
            const [columns] = await pool.query(`
                SHOW COLUMNS FROM ${table} LIKE 'email_verified'
            `);
            
            if (columns.length === 0) {
                console.error(`❌ ERROR: Columna email_verified falta en tabla ${table}`);
                console.error(`💡 Ejecuta manualmente en phpMyAdmin`);
                process.exit(1);
            }
            
            console.log(`✅ Columna email_verified existe en ${table}`);
        }
        
        console.log('🎉 Todas las tablas de verificación están listas\n');
        
    } catch (error) {
        console.error('❌ Error verificando tablas:', error.message);
        process.exit(1);
    }
}

// Llamar la verificación al inicio
checkVerificationTables();

// ==========================
// FUNCIÓN PARA ENVIAR EMAIL DE VERIFICACIÓN
// ==========================
async function sendVerificationEmail(email, nombre, codigo, userType) {
    const userTypeNames = {
        'admin': 'Administrador',
        'empleado': 'Empleada',
        'cliente': 'Cliente',
        'empresa': 'Empresa'
    };

    // Modo prueba si no hay transporter
    if (!transporter) {
        console.log('\n📧 MODO PRUEBA - Código de verificación:');
        console.log('Para:', email);
        console.log('Usuario:', nombre);
        console.log('Tipo:', userTypeNames[userType]);
        console.log('Código:', codigo);
        console.log('='.repeat(50));
        return { sent: true, mode: 'console' };
    }

    const mailOptions = {
        from: `"CollService" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Verifica tu correo electrónico - CollService',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; }
                    .header { background: linear-gradient(90deg, #e76bb2, #a18cd1); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { padding: 30px; background: #f9f9f9; }
                    .code-container { text-align: center; margin: 30px 0; }
                    .code { font-size: 42px; font-weight: bold; color: #e76bb2; background: white; padding: 25px; border: 3px dashed #e76bb2; border-radius: 15px; display: inline-block; letter-spacing: 10px; }
                    .expiry { color: #666; font-size: 14px; margin-top: 10px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 5px; color: #856404; }
                    .footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                    .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">CollService</div>
                    <h2 style="margin: 10px 0 0 0; font-weight: normal;">Verificación de Correo</h2>
                </div>
                <div class="content">
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>¡Bienvenido(a) a <strong>CollService</strong> como ${userTypeNames[userType]}!</p>
                    <p>Para activar tu cuenta, ingresa este código de verificación:</p>
                    
                    <div class="code-container">
                        <div class="code">${codigo}</div>
                        <div class="expiry">⏰ Válido por 24 horas</div>
                    </div>
                    
                    <div class="warning">
                        <p><strong>⚠️ Importante:</strong></p>
                        <p>• No podrás iniciar sesión hasta verificar tu email</p>
                        <p>• El código expira en 24 horas</p>
                        <p>• Si no solicitaste este registro, ignora este email</p>
                    </div>
                    
                    <p>Saludos,<br>El equipo de <strong>CollService</strong></p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} CollService. Todos los derechos reservados.</p>
                    <p>Este es un mensaje automático, por favor no responder.</p>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de verificación enviado a ${userType}:`, email);
        return { sent: true, mode: 'email' };
    } catch (error) {
        console.error('❌ Error enviando email:', error.message);
        return { sent: false, error: error.message };
    }
}

// ==========================
// CONFIGURACIÓN MULTER (ARCHIVOS)
// ==========================
const uploadDir = 'uploads/empleadas';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

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

// ==========================
// RUTA DE PRUEBA
// ==========================
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
// REGISTRO DE EMPLEADA (CON VERIFICACIÓN)
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
            fecha_nacimiento,  
            correo,
            telefono,
            direccion,
            experiencia,
            disponibilidad,
            contrasena,
            confirmarContrasena,
            aceptar_terminos,
            fecha_registro    
        } = req.body;

        console.log('📥 Registro empleada:', { nombre, correo });

        // Validaciones básicas
        if (!nombre || !apellido || !cedula || !correo || !contrasena) {
            return res.status(400).json({ 
                error: 'Faltan campos obligatorios: nombre, apellido, cédula, correo o contraseña' 
            });
        }

        if (contrasena !== confirmarContrasena) {
            return res.status(400).json({ 
                error: 'Las contraseñas no coinciden' 
            });
        }

        if (!aceptar_terminos || aceptar_terminos === 'false') {
            return res.status(400).json({ 
                error: 'Debe aceptar los términos y condiciones' 
            });
        }

        if (!/^[0-9]{6,12}$/.test(cedula)) {
            return res.status(400).json({ 
                error: 'La cédula debe tener entre 6 y 12 dígitos' 
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            return res.status(400).json({ 
                error: 'Formato de correo electrónico inválido' 
            });
        }

        if (telefono && !/^[0-9]{7,15}$/.test(telefono)) {
            return res.status(400).json({ 
                error: 'El teléfono debe tener entre 7 y 15 dígitos' 
            });
        }

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

        // Validar archivos
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

        // Generar código de verificación
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        // Insertar empleada
        const sql = `
            INSERT INTO empleado (
                documento_empleado,
                nombre_empleado,
                apellido_empleado,
                correo_empleado,
                contrasena_empleado,
                telefono_empleado,
                direccion_empleado,
                perfil_laboral,
                experiencia_laboral,
                servicios_realizados,
                disponibilidad,
                fecha_nacimiento,
                fecha_registro,
                email_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            cedula,
            nombre,
            apellido,
            correo,
            hashedPassword,
            telefono || null,
            direccion || null,
            'Empleada doméstica',
            experiencia || 'Sin experiencia especificada',
            'Ninguno',
            disponibilidad || 'Disponibilidad no especificada',
            fecha_nacimiento || null,
            fecha_registro || new Date().toISOString().split('T')[0],
            false  // email_verified inicialmente false
        ];

        console.log('📤 Insertando empleada con código:', verificationCode);

        await connection.execute(sql, valores);

        // Guardar código de verificación
        await connection.execute(
            `INSERT INTO email_verifications (email, code, user_type, user_id, expires_at)
             VALUES (?, ?, 'empleado', ?, ?)`,
            [correo, verificationCode, cedula, verificationExpires]
        );

        // Enviar email de verificación
        const emailSent = await sendVerificationEmail(correo, nombre, verificationCode, 'empleado');

        await connection.commit();

        return res.json({ 
            mensaje: '✅ Empleada registrada. Verifica tu correo electrónico para activar tu cuenta.',
            success: true,
            requiresVerification: true,
            email: correo,
            debugCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
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
        
        return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
    } finally {
        connection.release();
    }
});

// ==========================
// REGISTRO DE ADMINISTRADOR (CON VERIFICACIÓN)
// ==========================
app.post('/api/administradores/registro', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
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

        console.log('📥 Registro administrador:', { usuario_admin, nombre, correo });

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
        const [existingUser] = await connection.query(
            'SELECT documento_admin FROM administrador WHERE documento_admin = ?',
            [usuario_admin]
        );
        
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'El usuario ya está registrado' });
        }

        const [existingEmail] = await connection.query(
            'SELECT correo_admin FROM administrador WHERE correo_admin = ?',
            [correo]
        );
        
        if (existingEmail.length > 0) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        // Hashear contraseña
        const hashed = await bcrypt.hash(contrasena, 10);

        // Generar código de verificación
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

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
            fechaRegistroValida,
            false  // email_verified
        ];

        // Insertar administrador
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
                fecha_registro,
                email_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.execute(sql, valores);

        // Guardar código de verificación
        await connection.execute(
            `INSERT INTO email_verifications (email, code, user_type, user_id, expires_at)
             VALUES (?, ?, 'admin', ?, ?)`,
            [correo, verificationCode, usuario_admin, verificationExpires]
        );

        // Enviar email de verificación
        const emailSent = await sendVerificationEmail(correo, nombre, verificationCode, 'admin');

        await connection.commit();

        return res.json({ 
            mensaje: '✅ Administrador registrado. Verifica tu correo electrónico.',
            success: true,
            requiresVerification: true,
            email: correo,
            debugCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        });
        
    } catch (err) {
        await connection.rollback();
        console.error('❌ ERROR registro admin:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El registro ya existe' });
        }
        
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

// ==========================
// REGISTRO DE CLIENTE PERSONA/EMPRESA (CON VERIFICACIÓN)
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
            throw { status: 400, message: 'Seleccione el tipo de cliente (Persona o Empresa).' };
        }

        const hashed = await bcrypt.hash(contrasena, 10);

        // PERSONA NATURAL
        if (tipo_cliente === "Persona") {
            if (!documento_cliente || !nombre_cliente || !correo_cliente || !contrasena) {
                throw { status: 400, message: 'Complete todos los campos requeridos' };
            }

            const tiposValidos = ['CC', 'CE', 'PA', 'TI'];
            if (tipo_documento && !tiposValidos.includes(tipo_documento)) {
                throw { status: 400, message: 'Tipo de documento no válido' };
            }

            // Verificar duplicados
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

            // Generar código de verificación
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            // Insertar cliente
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
                    historial_servicios,
                    email_verified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                historial_servicios || null,
                false  // email_verified
            ]);

            // Guardar código de verificación
            await connection.execute(
                `INSERT INTO email_verifications (email, code, user_type, user_id, expires_at)
                 VALUES (?, ?, 'cliente', ?, ?)`,
                [correo_cliente, verificationCode, documento_cliente, verificationExpires]
            );

            // Enviar email de verificación
            await sendVerificationEmail(correo_cliente, nombre_cliente, verificationCode, 'cliente');

            await connection.commit();
            return res.json({ 
                mensaje: '✅ Persona Natural registrada. Verifica tu correo electrónico.',
                tipo: 'persona',
                success: true,
                requiresVerification: true,
                email: correo_cliente,
                debugCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
            });
        }

        // EMPRESA
        else if (tipo_cliente === "Empresa") {
            if (!razon_social || !nit_empresa || !correo_empresa || !contrasena) {
                throw { status: 400, message: 'Complete todos los campos requeridos' };
            }

            // Verificar duplicados
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

            // Generar código de verificación
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            // Insertar empresa
            const sqlEmpresa = `
                INSERT INTO empresa (
                    razon_social,
                    nlt,
                    representante_legal,
                    direccion,
                    telefono_empresa,
                    correo_empresa,
                    contrasena,
                    fecha_registro,
                    email_verified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await connection.execute(sqlEmpresa, [
                razon_social,
                nit_empresa,
                representante_legal || null,
                direccion_cliente || null,
                telefono_empresa || null,
                correo_empresa,
                hashed,
                fecha_registro || new Date().toISOString().split('T')[0],
                false  // email_verified
            ]);

            // Guardar código de verificación
            await connection.execute(
                `INSERT INTO email_verifications (email, code, user_type, user_id, expires_at)
                 VALUES (?, ?, 'empresa', ?, ?)`,
                [correo_empresa, verificationCode, nit_empresa, verificationExpires]
            );

            // Enviar email de verificación
            await sendVerificationEmail(correo_empresa, razon_social, verificationCode, 'empresa');

            await connection.commit();
            return res.json({ 
                mensaje: '✅ Empresa registrada. Verifica tu correo electrónico.',
                tipo: 'empresa',
                success: true,
                requiresVerification: true,
                email: correo_empresa,
                debugCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
            });
        }
        else {
            throw { status: 400, message: 'Tipo de cliente no válido' };
        }
        
    } catch (err) {
        await connection.rollback();
        console.error('ERROR registro cliente:', err);
        
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        
        return res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

// ==========================
// LOGIN (CON VERIFICACIÓN DE EMAIL)
// ==========================
app.post('/api/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
        }

        console.log('🔐 Login para:', correo);

        // Buscar en Administradores (con email_verified)
        let [rows] = await pool.query(
            `SELECT documento_admin as id, correo_admin AS correo, contraseña_admin AS password, 
                    'admin' AS rol, nombre_admin as nombre, email_verified as verified 
             FROM administrador WHERE correo_admin = ?`, 
            [correo]
        );
        
        // Buscar en Empleados (con email_verified)
        if (rows.length === 0) {
            [rows] = await pool.query(
                `SELECT documento_empleado as id, correo_empleado AS correo, contrasena_empleado AS password, 
                        'empleado' AS rol, nombre_empleado as nombre, email_verified as verified 
                 FROM empleado WHERE correo_empleado = ?`, 
                [correo]
            );
        }

        // Buscar en Clientes (con email_verified)
        if (rows.length === 0) {
            [rows] = await pool.query(
                `SELECT documento_cliente as id, correo_cliente AS correo, contrasena AS password, 
                        'cliente' AS rol, nombre_cliente as nombre, email_verified as verified 
                 FROM cliente WHERE correo_cliente = ?`, 
                [correo]
            );
        }

        // Buscar en Empresas (con email_verified)
        if (rows.length === 0) {
            [rows] = await pool.query(
                `SELECT nlt as id, correo_empresa AS correo, contrasena AS password, 
                        'empresa' AS rol, razon_social as nombre, email_verified as verified 
                 FROM empresa WHERE correo_empresa = ?`, 
                [correo]
            );
        }

        if (rows.length === 0) {
            console.log('❌ Usuario no encontrado:', correo);
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = rows[0];
        console.log('✅ Usuario encontrado:', usuario.nombre, 'Rol:', usuario.rol);

        // Verificar si el email está verificado
        if (!usuario.verified) {
            console.log('❌ Email no verificado para:', correo);
            return res.status(403).json({ 
                error: "Debes verificar tu email antes de iniciar sesión",
                requiresVerification: true,
                email: correo,
                userType: usuario.rol
            });
        }

        const match = await bcrypt.compare(contrasena, usuario.password);
        
        if (!match) {
            console.log('❌ Contraseña incorrecta para:', correo);
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        delete usuario.password;
        delete usuario.verified;
        
        console.log('✅ Login exitoso para:', usuario.nombre);
        
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
// VERIFICAR CÓDIGO DE EMAIL
// ==========================
app.post('/api/verify-email', async (req, res) => {
    console.log('\n🔐 VERIFICACIÓN DE EMAIL');
    
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ 
                error: 'Email y código son requeridos',
                success: false
            });
        }

        console.log('Verificando:', email);

        // Buscar código válido
        const [verifications] = await pool.query(`
            SELECT * FROM email_verifications 
            WHERE email = ? 
            AND code = ?
            AND expires_at > NOW()
            AND verified = FALSE
            ORDER BY created_at DESC
            LIMIT 1
        `, [email, code]);

        if (verifications.length === 0) {
            console.log('❌ Código inválido o expirado');
            return res.status(400).json({ 
                error: 'Código inválido o expirado',
                success: false
            });
        }

        const verification = verifications[0];
        console.log('✅ Código válido. Tipo:', verification.user_type, 'ID:', verification.user_id);

        // Marcar como verificado
        await pool.execute(
            'UPDATE email_verifications SET verified = TRUE WHERE id = ?',
            [verification.id]
        );

        // Actualizar la tabla correspondiente
        let updateQuery = '';
        let updateParams = [];
        
        switch (verification.user_type) {
            case 'admin':
                updateQuery = 'UPDATE administrador SET email_verified = TRUE WHERE documento_admin = ?';
                updateParams = [verification.user_id];
                break;
            case 'empleado':
                updateQuery = 'UPDATE empleado SET email_verified = TRUE WHERE documento_empleado = ?';
                updateParams = [verification.user_id];
                break;
            case 'cliente':
                updateQuery = 'UPDATE cliente SET email_verified = TRUE WHERE documento_cliente = ?';
                updateParams = [verification.user_id];
                break;
            case 'empresa':
                updateQuery = 'UPDATE empresa SET email_verified = TRUE WHERE nlt = ?';
                updateParams = [verification.user_id];
                break;
            default:
                throw new Error('Tipo de usuario no válido');
        }

        await pool.execute(updateQuery, updateParams);

        console.log(`✅ Email verificado para ${verification.user_type}:`, email);

        res.status(200).json({
            message: '✅ Correo verificado exitosamente. ¡Ya puedes iniciar sesión!',
            success: true,
            verified: true,
            userType: verification.user_type
        });

    } catch (error) {
        console.error('❌ Error en /api/verify-email:', error);
        res.status(500).json({ 
            error: 'Error al verificar el email',
            success: false
        });
    }
});

// ==========================
// REENVIAR CÓDIGO DE VERIFICACIÓN
// ==========================
app.post('/api/resend-verification', async (req, res) => {
    try {
        const { email, userType } = req.body;
        
        if (!email || !userType) {
            return res.status(400).json({ 
                error: 'Email y tipo de usuario son requeridos',
                success: false
            });
        }

        console.log('Reenviando código a:', email, 'Tipo:', userType);

        // Buscar usuario
        let user = null;
        let userId = '';
        
        switch (userType) {
            case 'admin':
                const [admins] = await pool.query(
                    'SELECT documento_admin as id, nombre_admin as nombre FROM administrador WHERE correo_admin = ?',
                    [email]
                );
                if (admins.length > 0) {
                    user = admins[0];
                    userId = user.id;
                }
                break;
            case 'empleado':
                const [empleados] = await pool.query(
                    'SELECT documento_empleado as id, nombre_empleado as nombre FROM empleado WHERE correo_empleado = ?',
                    [email]
                );
                if (empleados.length > 0) {
                    user = empleados[0];
                    userId = user.id;
                }
                break;
            case 'cliente':
                const [clientes] = await pool.query(
                    'SELECT documento_cliente as id, nombre_cliente as nombre FROM cliente WHERE correo_cliente = ?',
                    [email]
                );
                if (clientes.length > 0) {
                    user = clientes[0];
                    userId = user.id;
                }
                break;
            case 'empresa':
                const [empresas] = await pool.query(
                    'SELECT nlt as id, razon_social as nombre FROM empresa WHERE correo_empresa = ?',
                    [email]
                );
                if (empresas.length > 0) {
                    user = empresas[0];
                    userId = user.id;
                }
                break;
        }

        if (!user) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado',
                success: false
            });
        }

        // Verificar si ya está verificado
        const [verified] = await pool.query(`
            SELECT * FROM email_verifications 
            WHERE email = ? AND user_type = ? AND verified = TRUE
        `, [email, userType]);

        if (verified.length > 0) {
            return res.status(400).json({ 
                error: 'Este email ya está verificado',
                success: false,
                alreadyVerified: true
            });
        }

        // Generar nuevo código
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Insertar o actualizar código
        await pool.execute(`
            INSERT INTO email_verifications (email, code, user_type, user_id, expires_at)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            code = VALUES(code),
            expires_at = VALUES(expires_at),
            verified = FALSE,
            created_at = CURRENT_TIMESTAMP
        `, [email, newCode, userType, userId, expiresAt]);

        // Enviar email
        const emailSent = await sendVerificationEmail(email, user.nombre, newCode, userType);

        console.log(`✅ Código reenviado a ${userType}:`, email);

        res.status(200).json({
            message: '✅ Nuevo código enviado a tu correo',
            success: true,
            debugCode: process.env.NODE_ENV === 'development' ? newCode : undefined
        });

    } catch (error) {
        console.error('❌ Error reenviando código:', error);
        res.status(500).json({ 
            error: 'Error al reenviar el código',
            success: false
        });
    }
});

// ==========================
// LISTAR ADMINISTRADORES
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

// ==========================
// RECUPERACIÓN DE CONTRASEÑA - GMAIL REAL
// ==========================

// 1. SOLICITAR CÓDIGO DE RECUPERACIÓN
app.post('/api/password/recover', async (req, res) => {
    console.log('\n' + '='.repeat(60));
    console.log('📧 SOLICITUD DE RECUPERACIÓN RECIBIDA');
    console.log('='.repeat(60));
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                error: 'El email es requerido',
                success: false 
            });
        }

        console.log('🔍 Buscando email:', email);

        // Verificar si el email existe
        let usuario = null;
        let userType = '';
        let userId = '';
        
        // Buscar en administradores
        const [admins] = await connection.query(
            'SELECT documento_admin as id, correo_admin as email, nombre_admin as nombre FROM administrador WHERE correo_admin = ?',
            [email]
        );
        
        if (admins.length > 0) {
            usuario = admins[0];
            userType = 'admin';
            userId = usuario.id;
            console.log('✅ Encontrado en: Administradores');
        }
        
        // Buscar en empleados
        if (!usuario) {
            const [empleados] = await connection.query(
                'SELECT documento_empleado as id, correo_empleado as email, nombre_empleado as nombre FROM empleado WHERE correo_empleado = ?',
                [email]
            );
            
            if (empleados.length > 0) {
                usuario = empleados[0];
                userType = 'empleado';
                userId = usuario.id;
                console.log('✅ Encontrado en: Empleados');
            }
        }
        
        // Buscar en clientes
        if (!usuario) {
            const [clientes] = await connection.query(
                'SELECT documento_cliente as id, correo_cliente as email, nombre_cliente as nombre FROM cliente WHERE correo_cliente = ?',
                [email]
            );
            
            if (clientes.length > 0) {
                usuario = clientes[0];
                userType = 'cliente';
                userId = usuario.id;
                console.log('✅ Encontrado en: Clientes');
            }
        }

        // Si NO existe
        if (!usuario) {
            console.log('❌ Email NO registrado en el sistema');
            
            await connection.commit();
            connection.release();
            
            // Por seguridad, respondemos igual
            return res.status(200).json({
                message: 'Si el email está registrado, recibirás un código de recuperación',
                success: true,
                emailExists: false
            });
        }

        console.log('👤 Usuario encontrado:', usuario.nombre);
        console.log('🎯 Tipo:', userType);
        console.log('🆔 ID:', userId);

        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        console.log('🔐 Código generado:', code);
        console.log('⏰ Expira:', expiresAt.toLocaleTimeString());

        // Guardar en tabla password_resets
        try {
            // Verificar si la tabla existe, si no crearla
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS password_resets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL,
                    code VARCHAR(6) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    role VARCHAR(20),
                    identifier VARCHAR(50),
                    used BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_email_code (email, code),
                    INDEX idx_expires (expires_at)
                )
            `);
            
            // Insertar código
            await connection.execute(
                'INSERT INTO password_resets (email, code, expires_at, role, identifier) VALUES (?, ?, ?, ?, ?)',
                [email, code, expiresAt, userType, userId]
            );
            
            console.log('💾 Código guardado en tabla password_resets');
        } catch (dbError) {
            console.warn('⚠️ No se pudo guardar en BD, continuando:', dbError.message);
        }

        // Configurar email profesional
        const mailOptions = {
            from: `"CollService" <${process.env.EMAIL_USER || 'noreply@collservice.com'}>`,
            to: email,
            subject: '🔐 Tu código de recuperación - CollService',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { 
                            font-family: 'Arial', sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            max-width: 600px; 
                            margin: 0 auto; 
                            padding: 0;
                        }
                        .header { 
                            background: linear-gradient(90deg, #e76bb2, #a18cd1); 
                            color: white; 
                            padding: 30px; 
                            text-align: center; 
                            border-radius: 10px 10px 0 0; 
                        }
                        .content { 
                            padding: 30px; 
                            background: #f9f9f9; 
                        }
                        .code-container { 
                            text-align: center; 
                            margin: 30px 0; 
                        }
                        .code { 
                            font-size: 42px; 
                            font-weight: bold; 
                            color: #e76bb2; 
                            background: white;
                            padding: 25px;
                            border: 3px dashed #e76bb2;
                            border-radius: 15px;
                            display: inline-block;
                            letter-spacing: 10px;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        }
                        .expiry { 
                            color: #666; 
                            font-size: 14px; 
                            margin-top: 10px; 
                        }
                        .warning { 
                            background: #fff3cd; 
                            border-left: 4px solid #ffc107; 
                            padding: 15px; 
                            margin: 25px 0; 
                            border-radius: 5px; 
                            color: #856404;
                        }
                        .footer { 
                            text-align: center; 
                            font-size: 12px; 
                            color: #777; 
                            margin-top: 30px; 
                            padding-top: 20px; 
                            border-top: 1px solid #eee; 
                        }
                        .logo { 
                            font-size: 28px; 
                            font-weight: bold; 
                            margin-bottom: 10px; 
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">CollService</div>
                        <h2 style="margin: 10px 0 0 0; font-weight: normal;">Recuperación de Contraseña</h2>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${usuario.nombre}</strong>,</p>
                        <p>Has solicitado restablecer tu contraseña en <strong>CollService</strong>.</p>
                        
                        <div class="code-container">
                            <div class="code">${code}</div>
                            <div class="expiry">⏰ Válido por 15 minutos</div>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ Importante:</strong></p>
                            <p>• Este código es válido por <strong>15 minutos</strong></p>
                            <p>• Si no solicitaste este cambio, ignora este email</p>
                            <p>• Tu contraseña actual permanecerá segura</p>
                        </div>
                        
                        <p>Ingresa este código en la página de recuperación para continuar con el proceso.</p>
                        
                        <p>Saludos,<br>El equipo de <strong>CollService</strong></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} CollService. Todos los derechos reservados.</p>
                        <p>Este es un mensaje automático, por favor no responder.</p>
                    </div>
                </body>
                </html>
            `,
            text: `CÓDIGO DE RECUPERACIÓN - CollService\n\nHola ${usuario.nombre},\n\nTu código de recuperación es: ${code}\n\nEste código es válido por 15 minutos (expira: ${expiresAt.toLocaleTimeString()}).\n\nSi no solicitaste restablecer tu contraseña, ignora este mensaje.\n\nSaludos,\nEquipo CollService`
        };

        // ENVIAR EMAIL CON GMAIL (si está configurado)
        if (transporter) {
            console.log('📤 Enviando email REAL a:', email);
            
            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('✅ EMAIL ENVIADO EXITOSAMENTE!');
                console.log('📨 Message ID:', info.messageId);
                console.log('👤 Para:', usuario.nombre);
                console.log('📧 Email:', email);
                console.log('🔐 Código:', code);
                console.log('⏰ Expira:', expiresAt.toLocaleTimeString());
                
            } catch (emailError) {
                console.error('❌ ERROR ENVIANDO EMAIL:', emailError.message);
                
                // Mostrar código para pruebas
                console.log('\n' + '='.repeat(60));
                console.log('🔐 CÓDIGO PARA PRUEBAS (Email falló):');
                console.log('Para:', email);
                console.log('Usuario:', usuario.nombre);
                console.log('Código:', code);
                console.log('='.repeat(60));
            }
        } else {
            // MODO PRUEBA: mostrar en consola
            console.log('\n' + '='.repeat(60));
            console.log('🔐 MODO PRUEBA - CÓDIGO GENERADO:');
            console.log('Para:', email);
            console.log('Usuario:', usuario.nombre);
            console.log('Código:', code);
            console.log('Tipo:', userType);
            console.log('ID:', userId);
            console.log('Expira:', expiresAt.toLocaleTimeString());
            console.log('='.repeat(60));
        }

        await connection.commit();
        connection.release();
        
        console.log('='.repeat(60) + '\n');
        
        res.status(200).json({
            message: '✅ Código de recuperación enviado a tu correo electrónico',
            success: true,
            emailExists: true,
            userType: userType,
            // En modo desarrollo, enviamos el código para pruebas
            debugCode: process.env.NODE_ENV === 'development' ? code : undefined
        });
        
    } catch (error) {
        await connection.rollback();
        connection.release();
        
        console.error('❌ ERROR EN /api/password/recover:', error);
        console.log('='.repeat(60) + '\n');
        
        res.status(500).json({ 
            error: 'Error interno del servidor',
            success: false,
            details: error.message
        });
    }
});

// 2. VERIFICAR CÓDIGO
app.post('/api/password/verify', async (req, res) => {
    console.log('\n🔍 VERIFICANDO CÓDIGO');
    
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ 
                error: 'Email y código son requeridos',
                success: false
            });
        }

        console.log('Email:', email);
        console.log('Código recibido:', code);

        // Buscar código en tabla password_resets
        const [codes] = await pool.query(`
            SELECT * FROM password_resets 
            WHERE email = ? 
            AND code = ?
            AND used = FALSE
            AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `, [email, code]);

        if (codes.length === 0) {
            console.log('❌ Código inválido o expirado');
            
            // Verificar si existe pero está expirado
            const [expiredCodes] = await pool.query(
                'SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = FALSE',
                [email, code]
            );
            
            if (expiredCodes.length > 0) {
                return res.status(400).json({ 
                    error: 'El código ha expirado. Solicita uno nuevo.',
                    success: false,
                    expired: true
                });
            }
            
            return res.status(400).json({ 
                error: 'Código inválido',
                success: false
            });
        }

        const validCode = codes[0];
        console.log('✅ Código válido encontrado');
        console.log('ID:', validCode.id);
        console.log('Role:', validCode.role);
        console.log('Identifier:', validCode.identifier);
        console.log('Expira:', validCode.expires_at);

        // Marcar código como usado
        await pool.execute(
            'UPDATE password_resets SET used = TRUE WHERE id = ?',
            [validCode.id]
        );

        console.log('✅ Código marcado como usado');
        
        res.status(200).json({
            message: '✅ Código verificado correctamente',
            success: true,
            verified: true,
            role: validCode.role,
            identifier: validCode.identifier
        });

    } catch (error) {
        console.error('❌ Error en /api/password/verify:', error);
        res.status(500).json({ 
            error: 'Error al verificar el código',
            success: false
        });
    }
});

// 3. RESTABLECER CONTRASEÑA
app.post('/api/password/reset', async (req, res) => {
    console.log('\n🔧 RESTABLECIENDO CONTRASEÑA');
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { email, code, newPassword, confirmPassword } = req.body;
        
        if (!email || !code || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos',
                success: false
            });
        }

        console.log('Email:', email);
        console.log('Nueva contraseña recibida');

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                error: 'Las contraseñas no coinciden',
                success: false
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener al menos 6 caracteres',
                success: false
            });
        }

        // Verificar que el código fue usado recientemente
        const [usedCodes] = await connection.query(`
            SELECT role, identifier FROM password_resets 
            WHERE email = ? 
            AND code = ?
            AND used = TRUE
            AND expires_at > NOW() - INTERVAL 30 MINUTE
            ORDER BY created_at DESC
            LIMIT 1
        `, [email, code]);

        if (usedCodes.length === 0) {
            console.log('❌ No hay solicitud válida o código no verificado');
            return res.status(400).json({ 
                error: 'No hay solicitud de recuperación válida. Solicita un nuevo código.',
                success: false
            });
        }

        const { role, identifier } = usedCodes[0];
        console.log('✅ Código verificado previamente');
        console.log('Role:', role);
        console.log('Identifier:', identifier);

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        let updated = false;
        let tableName, idField, emailField, passwordField;

        // Determinar en qué tabla actualizar basado en el role
        switch (role) {
            case 'admin':
                tableName = 'administrador';
                idField = 'documento_admin';
                emailField = 'correo_admin';
                passwordField = 'contraseña_admin';
                break;
            case 'empleado':
                tableName = 'empleado';
                idField = 'documento_empleado';
                emailField = 'correo_empleado';
                passwordField = 'contrasena_empleado';
                break;
            case 'cliente':
                tableName = 'cliente';
                idField = 'documento_cliente';
                emailField = 'correo_cliente';
                passwordField = 'contrasena';
                break;
            default:
                throw new Error('Role no válido: ' + role);
        }

        // Actualizar contraseña
        const [result] = await connection.execute(
            `UPDATE ${tableName} SET ${passwordField} = ? WHERE ${idField} = ? AND ${emailField} = ?`,
            [hashedPassword, identifier, email]
        );

        if (result.affectedRows === 0) {
            console.log('❌ No se pudo actualizar la contraseña');
            throw new Error('No se pudo actualizar la contraseña');
        }

        updated = true;
        console.log(`✅ Contraseña actualizada en tabla ${tableName} para ID: ${identifier}`);

        // Enviar email de confirmación si está configurado
        if (transporter && process.env.EMAIL_USER) {
            try {
                const confirmMailOptions = {
                    from: `"CollService" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: '✅ Contraseña actualizada exitosamente - CollService',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2 style="color: #4CAF50;">¡Contraseña actualizada!</h2>
                            <p>Hola,</p>
                            <p>Tu contraseña en <strong>CollService</strong> ha sido actualizada exitosamente.</p>
                            <p>Si no realizaste este cambio, por favor contacta a soporte inmediatamente.</p>
                            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                            <br>
                            <p>Saludos,<br>El equipo de CollService</p>
                        </div>
                    `
                };

                await transporter.sendMail(confirmMailOptions);
                console.log('📧 Email de confirmación enviado');
            } catch (emailError) {
                console.warn('⚠️ No se pudo enviar email de confirmación:', emailError.message);
            }
        }

        await connection.commit();
        connection.release();
        
        console.log(`🎉 Contraseña actualizada exitosamente para ${email} (${role})`);
        
        res.status(200).json({
            message: '✅ Contraseña actualizada exitosamente',
            success: true,
            role: role
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        
        console.error('❌ Error en /api/password/reset:', error);
        res.status(500).json({ 
            error: 'Error al restablecer la contraseña',
            success: false,
            details: error.message
        });
    }
});

// ==========================
// ENDPOINT PARA PROBAR CONEXIÓN EMAIL
// ==========================
app.post('/api/email/test', async (req, res) => {
    try {
        const { toEmail } = req.body;
        
        if (!toEmail) {
            return res.status(400).json({ error: 'Email destino requerido' });
        }

        if (!transporter) {
            return res.status(400).json({ 
                error: 'Email no configurado. Verifica tu .env',
                config: {
                    EMAIL_USER: process.env.EMAIL_USER ? 'Configurado' : 'No configurado',
                    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Configurado' : 'No configurado'
                }
            });
        }

        const testMailOptions = {
            from: `"CollService Test" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '✅ Prueba de Email - CollService',
            text: 'Este es un email de prueba desde CollService. Si recibes esto, el email está funcionando correctamente.',
            html: '<h2>✅ Prueba de Email Exitosa</h2><p>Este es un email de prueba desde CollService.</p><p>Si recibes esto, el email está funcionando correctamente.</p>'
        };

        const info = await transporter.sendMail(testMailOptions);
        
        console.log('✅ Email de prueba enviado a:', toEmail);
        console.log('📨 Message ID:', info.messageId);
        
        res.json({
            success: true,
            message: 'Email de prueba enviado exitosamente',
            to: toEmail,
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('❌ Error enviando email de prueba:', error);
        res.status(500).json({ 
            error: 'Error enviando email de prueba',
            details: error.message
        });
    }
});

// ==========================
// INICIAR SERVIDOR
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVIDOR COLLSERVICE CON VERIFICACIÓN DE EMAIL');
    console.log('='.repeat(60));
    console.log(`📡 Puerto: http://localhost:${PORT}`);
    console.log(`📧 Email: ${process.env.EMAIL_USER || 'MODO PRUEBA (no configurado)'}`);
    console.log(`🗄️  BD: ${process.env.DB_NAME || 'collservice'}`);
    console.log(`👤 DB User: ${process.env.DB_USER || 'root'}`);
    console.log(`🔗 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log('='.repeat(60));
    console.log('🔐 SISTEMA DE VERIFICACIÓN ACTIVO:');
    console.log('   POST /api/verify-email        - Verificar código de email');
    console.log('   POST /api/resend-verification - Reenviar código');
    console.log('='.repeat(60));
    console.log('👥 REGISTROS CON VERIFICACIÓN:');
    console.log('   POST /api/empleadas/registro    - Empleada (envía código)');
    console.log('   POST /api/administradores/registro - Admin (envía código)');
    console.log('   POST /api/clientes/registro     - Cliente/Empresa (envía código)');
    console.log('='.repeat(60));
    console.log('🔐 ENDPOINTS DE RECUPERACIÓN:');
    console.log('   POST /api/password/recover  - Solicitar código');
    console.log('   POST /api/password/verify   - Verificar código');
    console.log('   POST /api/password/reset    - Cambiar contraseña');
    console.log('='.repeat(60));
    console.log('👥 ENDPOINTS PRINCIPALES:');
    console.log('   POST /api/login             - Login (verifica email)');
    console.log('   GET  /api/administradores   - Listar admins');
    console.log('   GET  /api/ping              - Prueba conexión BD');
    console.log('='.repeat(60));
    console.log('📁 SERVICIO DE ARCHIVOS:');
    console.log(`   http://localhost:${PORT}/uploads/`);
    console.log('='.repeat(60) + '\n');
});