  const mysql = require('mysql2/promise');
  require('dotenv').config();

  (async ()=>{
    const email = process.argv[2];
    if(!email){
      console.error('Usage: node checkEmail.js email');
      process.exit(1);
    }
    try{
      const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'collservice',
        waitForConnections: true,
        connectionLimit: 5
      });

      const [admins] = await pool.query('SELECT documento_admin, correo_admin FROM administrador WHERE correo_admin = ?', [email]);
      const [empleados] = await pool.query('SELECT documento_empleado, correo_empleado FROM empleado WHERE correo_empleado = ?', [email]);
      const [clientes] = await pool.query('SELECT documento_cliente, correo_cliente FROM cliente WHERE correo_cliente = ?', [email]);

      console.log('admins:', admins);
      console.log('empleados:', empleados);
      console.log('clientes:', clientes);
      process.exit(0);
    }catch(e){
      console.error('error', e.message);
      process.exit(2);
    }
  })();
