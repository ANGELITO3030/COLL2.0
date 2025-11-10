require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Mailer
const nodemailer = require('nodemailer');

// In-memory store for reset codes: { email: { code, expires, role, identifier } }
const resetStore = {};

// Create transporter when SMTP env available
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// ==========================
// Pool de conexiones a MySQL
// ==========================
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

// Ensure password_resets table exists (for persistent reset tokens)
;(async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(12) NOT NULL,
        expires_at BIGINT NOT NULL,
        role VARCHAR(50),
        identifier VARCHAR(255),
        used TINYINT(1) DEFAULT 0,
        created_at BIGINT NOT NULL,
        INDEX(email),
        INDEX(code),
        INDEX(expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error('Error creating password_resets table:', err);
  }
  // Create ratings table
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(128) NOT NULL,
        voter_id VARCHAR(128) NOT NULL,
        rating TINYINT NOT NULL,
        comment TEXT DEFAULT NULL,
        created_at BIGINT NOT NULL,
        updated_at BIGINT DEFAULT NULL,
        UNIQUE KEY unique_vote (employee_id, voter_id),
        INDEX(employee_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error('Error creating ratings table:', err);
  }
})();

// ==========================
// Ruta de prueba
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
// Registro de Administrador
// ==========================
app.post('/api/administradores/registro', async (req, res) => {
  try {
    const { nombre, correo, telefono, usuario_admin, contrasena, cargo, area, tipo_acceso } = req.body;

    if (!usuario_admin || !nombre || !correo || !contrasena || !cargo || !area) {
      return res.status(400).json({ error: 'Faltan campos obligatorios. Por favor complete: usuario, nombre, correo, contraseña, cargo y área.' });
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    const sql = `
      INSERT INTO administrador (
        documento_admin,
        nombre_admin,
        telefono_admin,
        cargo,
        area,
        nivel_acceso,
        correo_admin,
        contraseña_admin
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      usuario_admin,
      nombre,
      telefono || null,
      cargo,
      area,
      tipo_acceso,
      correo,
      hashed
    ]);

    return res.json({ mensaje: 'Administrador registrado con éxito ✅' });
  } catch (err) {
    console.error('ERROR DETALLADO:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Documento o correo ya registrado' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// ==========================
// Registro de Cliente
// ==========================
app.post('/api/clientes/registro', async (req, res) => {
  try {
    const {
      documento_cliente,
      nombre_cliente,
      apellido_cliente,
      direccion_cliente,
      telefono_cliente,
      correo_cliente,
      contrasena,
      historial_servicios
    } = req.body;

    if (!documento_cliente || !nombre_cliente || !correo_cliente || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (documento, nombre, correo, contrasena).' });
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    const sql = `
      INSERT INTO cliente (
        documento_cliente,
        nombre_cliente,
        apellido_cliente,
        direccion_cliente,
        telefono_cliente,
        correo_cliente,
        contrasena,
        historial_servicios
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      documento_cliente,
      nombre_cliente,
      apellido_cliente || null,
      direccion_cliente || null,
      telefono_cliente || null,
      correo_cliente,
      hashed,
      historial_servicios || null
    ]);

    return res.json({ mensaje: 'Cliente registrado con éxito ✅' });
  } catch (err) {
    console.error('ERROR DETALLADO:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Documento o correo ya registrado' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// ==========================
// Registro de Empleado
// ==========================
app.post('/api/empleadas/registro', async (req, res) => {
  try {
    const {
      documento_empleado,
      nombre_empleado,
      apellido_empleado,
      telefono_empleado,
      direccion_empleado,
      perfil_laboral,
      experiencia_laboral,
      servicios_realizados,
      disponibilidad,
      correo_empleado,
      contrasena_empleado
    } = req.body;

    if (!documento_empleado || !nombre_empleado || !apellido_empleado || !correo_empleado || !contrasena_empleado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const hashed = await bcrypt.hash(contrasena_empleado, 10);

    const sql = `
      INSERT INTO empleado (
        documento_empleado,
        nombre_empleado,
        apellido_empleado,
        telefono_empleado,
        direccion_empleado,
        perfil_laboral,
        experiencia_laboral,
        servicios_realizados,
        disponibilidad,
        correo_empleado,
        contrasena_empleado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      documento_empleado,
      nombre_empleado,
      apellido_empleado,
      telefono_empleado || null,
      direccion_empleado || null,
      perfil_laboral || null,
      experiencia_laboral || null,
      servicios_realizados || null,
      disponibilidad || null,
      correo_empleado,
      hashed
    ]);

    res.json({ mensaje: 'Empleado registrado con éxito ✅' });

  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Documento o correo ya registrado' });
    }
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================
// Login (para cualquier rol)
// ==========================
app.post('/api/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    // 1. Buscar en Administradores
    let [rows] = await pool.query("SELECT correo_admin AS correo, contraseña_admin AS password, nivel_acceso AS rol FROM administrador WHERE correo_admin = ?", [correo]);
    
    if (rows.length === 0) {
      // 2. Buscar en Empleados
      [rows] = await pool.query("SELECT correo_empleado AS correo, contrasena_empleado AS password, 'empleado' AS rol FROM empleado WHERE correo_empleado = ?", [correo]);
    }

    if (rows.length === 0) {
      // 3. Buscar en Clientes
      [rows] = await pool.query("SELECT correo_cliente AS correo, contrasena AS password, 'cliente' AS rol FROM cliente WHERE correo_cliente = ?", [correo]);
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    // Comparar contraseñas con bcrypt
    const match = await bcrypt.compare(contrasena, usuario.password);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Respuesta OK
    res.json({ mensaje: "✅ Login exitoso", rol: usuario.rol });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// ==========================
// Login
// ==========================
app.post("/api/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    // Buscar en administradores
    const [admin] = await pool.query(
      "SELECT * FROM administrador WHERE correo_admin = ?",
      [correo]
    );
    if (admin.length > 0) {
      const match = await bcrypt.compare(contrasena, admin[0].contraseña_admin);
      if (match) return res.json({ rol: "admin" });
    }

    // Buscar en empleados
    const [empleado] = await pool.query(
      "SELECT * FROM empleado WHERE correo_empleado = ?",
      [correo]
    );
    if (empleado.length > 0) {
      const match = await bcrypt.compare(contrasena, empleado[0].contrasena_empleado);
      if (match) return res.json({ rol: "empleado" });
    }

    // Buscar en clientes
    const [cliente] = await pool.query(
      "SELECT * FROM cliente WHERE correo_cliente = ?",
      [correo]
    );
    if (cliente.length > 0) {
      const match = await bcrypt.compare(contrasena, cliente[0].contrasena);
      if (match) return res.json({ rol: "cliente" });
    }

    // Si no coincide con nada
    return res.status(401).json({ error: "Credenciales inválidas" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});


// ==========================
// Iniciar servidor
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});

// ==========================
// Password recovery endpoints
// ==========================

// Request recovery code
app.post('/api/password/recover', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    // Buscar en los tres tipos
    let role = null;
    let identifier = null; // documento or id to identify user

    const [admins] = await pool.query('SELECT documento_admin AS id, correo_admin AS correo FROM administrador WHERE correo_admin = ?', [email]);
    if (admins.length > 0) { role = 'admin'; identifier = admins[0].id; }

    const [empleados] = await pool.query('SELECT documento_empleado AS id, correo_empleado AS correo FROM empleado WHERE correo_empleado = ?', [email]);
    if (!role && empleados.length > 0) { role = 'empleado'; identifier = empleados[0].id; }

    const [clientes] = await pool.query('SELECT documento_cliente AS id, correo_cliente AS correo FROM cliente WHERE correo_cliente = ?', [email]);
    if (!role && clientes.length > 0) { role = 'cliente'; identifier = clientes[0].id; }

    if (!role) return res.status(404).json({ error: 'Email no registrado' });

    // generar código 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // 15 min
    // Persistir en la tabla password_resets
    try {
      await pool.execute(
        'INSERT INTO password_resets (email, code, expires_at, role, identifier, used, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)',
        [email, code, expires, role, identifier, Date.now()]
      );
    } catch (dbErr) {
      console.error('Error saving reset token:', dbErr);
    }

    // intentar enviar email si transporter configurado
    if (transporter) {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Código para recuperar contraseña - Coll Service',
        text: `Tu código para recuperar la contraseña es: ${code} (válido 15 minutos)`
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error('Error enviando email:', mailErr);
        // no fallamos la petición, devolvemos el código en response en entorno de desarrollo
        if (process.env.NODE_ENV !== 'production') return res.json({ ok: true, debugCode: code });
      }
    } else {
      // no hay transporter configurado, en desarrollo devolvemos el código para pruebas
      if (process.env.NODE_ENV !== 'production') return res.json({ ok: true, debugCode: code });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('recover error', err);
    return res.status(500).json({ error: 'Error interno' });
  }
});

  // ==========================
  // Ratings endpoints
  // ==========================

  // Get ratings summary and optionally the user's own rating
  app.get('/api/ratings/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      const voterId = req.query.voterId || null;

      const [rows] = await pool.query('SELECT rating, voter_id, comment FROM ratings WHERE employee_id = ?', [employeeId]);
      const count = rows.length;
      const avg = count ? (rows.reduce((s, r) => s + r.rating, 0) / count) : 0;
      let userRating = null;
      if (voterId) {
        const found = rows.find(r => r.voter_id === voterId);
        if (found) userRating = found.rating;
      }

      return res.json({ ok: true, avg: Math.round(avg * 10) / 10, count, userRating, history: rows.slice(-10).map(r => ({ rating: r.rating, comment: r.comment })) });
    } catch (err) {
      console.error('ratings GET error', err);
      return res.status(500).json({ error: 'Error interno' });
    }
  });

  // Upsert rating (create or update by voterId)
  app.post('/api/ratings', async (req, res) => {
    try {
      const { employeeId, rating, voterId, comment } = req.body;
      if (!employeeId || !rating || !voterId) return res.status(400).json({ error: 'employeeId, rating y voterId son requeridos' });

      const now = Date.now();
      // Try update first
      const [updated] = await pool.execute('UPDATE ratings SET rating = ?, comment = ?, updated_at = ? WHERE employee_id = ? AND voter_id = ?', [rating, comment || null, now, employeeId, voterId]);
      if (updated && updated.affectedRows === 0) {
        await pool.execute('INSERT INTO ratings (employee_id, voter_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)', [employeeId, voterId, rating, comment || null, now]);
      }

      // return fresh summary
      const [rows] = await pool.query('SELECT rating FROM ratings WHERE employee_id = ?', [employeeId]);
      const count = rows.length;
      const avg = count ? (rows.reduce((s, r) => s + r.rating, 0) / count) : 0;
      return res.json({ ok: true, avg: Math.round(avg * 10) / 10, count, userRating: Number(rating) });
    } catch (err) {
      console.error('ratings POST error', err);
      return res.status(500).json({ error: 'Error interno' });
    }
  });

  // Delete rating by voter
  app.delete('/api/ratings', async (req, res) => {
    try {
      const { employeeId, voterId } = req.body;
      if (!employeeId || !voterId) return res.status(400).json({ error: 'employeeId y voterId son requeridos' });
      await pool.execute('DELETE FROM ratings WHERE employee_id = ? AND voter_id = ?', [employeeId, voterId]);
      const [rows] = await pool.query('SELECT rating FROM ratings WHERE employee_id = ?', [employeeId]);
      const count = rows.length; const avg = count ? (rows.reduce((s, r) => s + r.rating, 0) / count) : 0;
      return res.json({ ok: true, avg: Math.round(avg * 10) / 10, count });
    } catch (err) {
      console.error('ratings DELETE error', err);
      return res.status(500).json({ error: 'Error interno' });
    }
  });

// Verify code
app.post('/api/password/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email y código son requeridos' });
    const [rows] = await pool.query('SELECT * FROM password_resets WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1', [email]);
    if (!rows || rows.length === 0) return res.status(400).json({ error: 'No hay solicitud de recuperación para este email' });
    const rec = rows[0];
    if (Date.now() > rec.expires_at) {
      // marcar como usado/invalidado
      await pool.execute('UPDATE password_resets SET used = 1 WHERE id = ?', [rec.id]);
      return res.status(400).json({ error: 'Código expirado' });
    }
    if (String(rec.code) !== String(code)) return res.status(400).json({ error: 'Código incorrecto' });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Reset password
app.post('/api/password/reset', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, código y nueva contraseña requeridos' });
    const [rows] = await pool.query('SELECT * FROM password_resets WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1', [email]);
    if (!rows || rows.length === 0) return res.status(400).json({ error: 'No hay solicitud de recuperación para este email' });
    const rec = rows[0];
    if (Date.now() > rec.expires_at) { await pool.execute('UPDATE password_resets SET used = 1 WHERE id = ?', [rec.id]); return res.status(400).json({ error: 'Código expirado' }); }
    if (String(rec.code) !== String(code)) return res.status(400).json({ error: 'Código incorrecto' });

    const hashed = await bcrypt.hash(newPassword, 10);
    if (rec.role === 'admin') {
      await pool.execute('UPDATE administrador SET contraseña_admin = ? WHERE correo_admin = ?', [hashed, email]);
    } else if (rec.role === 'empleado') {
      await pool.execute('UPDATE empleado SET contrasena_empleado = ? WHERE correo_empleado = ?', [hashed, email]);
    } else if (rec.role === 'cliente') {
      await pool.execute('UPDATE cliente SET contrasena = ? WHERE correo_cliente = ?', [hashed, email]);
    }

    await pool.execute('UPDATE password_resets SET used = 1 WHERE id = ?', [rec.id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno' });
  }
});
