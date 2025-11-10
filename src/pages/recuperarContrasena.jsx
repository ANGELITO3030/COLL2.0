import { useState } from "react";
import axios from "axios";

export default function RecuperarContrasena({ setView }) {
  const [form, setForm] = useState({ email: "" });
  const [step, setStep] = useState(1); // 1: pedir email, 2: código, 3: nueva contraseña, 4: éxito
  const [error, setError] = useState("");
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [debugCode, setDebugCode] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email) return setError("Por favor ingresa tu correo electrónico.");
    try {
      const res = await axios.post("http://localhost:5000/api/password/recover", { email: form.email });
      // en desarrollo backend puede devolver debugCode para pruebas
      if (res.data?.debugCode) setDebugCode(String(res.data.debugCode));
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Error al solicitar código");
    }
  };

  const handleCodigoSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!codigoIngresado) return setError("Ingresa el código");
    try {
      await axios.post("http://localhost:5000/api/password/verify", { email: form.email, code: codigoIngresado });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Código inválido");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPassword || newPassword.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    try {
      await axios.post("http://localhost:5000/api/password/reset", { email: form.email, code: codigoIngresado, newPassword });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña");
    }
  };

  return (
    <>
      <style>{`
        .login-container {
          background: white;
          padding: 35px 40px;
          border-radius: 16px;
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
          width: 380px;
          text-align: center;
          border-top: 6px solid #e76bb2;
          margin: 40px auto;
        }
        .login-container h2 {
          margin-bottom: 20px;
          color: #e76bb2;
          font-size: 26px;
          font-weight: bold;
        }
        .input-group {
          margin-bottom: 18px;
          text-align: left;
        }
        .input-group label {
          display: block;
          font-size: 14px;
          margin-bottom: 6px;
          color: #444;
        }
        .input-group input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font-size: 14px;
          transition: border 0.3s;
        }
        .input-group input:focus {
          border-color: #a18cd1;
          outline: none;
        }
        .btn-login {
          width: 100%;
          padding: 12px;
          background: linear-gradient(90deg, #fbc2eb, #a18cd1);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.3s;
        }
        .btn-login:hover {
          opacity: 0.9;
        }
        .extra {
          margin-top: 20px;
          font-size: 14px;
          color: #555;
        }
        .extra a {
          color: #e76bb2;
          text-decoration: none;
          font-weight: bold;
        }
        .extra a:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="login-container">
        <h2>Recuperar Contraseña</h2>
        {step === 1 && (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej: usuario@email.com"
                required
              />
            </div>
            <button type="submit" className="btn-login">
              Recuperar contraseña
            </button>
            {error && <div style={{ color: '#e74c3c', marginTop: 10 }}>{error}</div>}
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleCodigoSubmit}>
            <div className="input-group">
              <label htmlFor="codigo">Ingresa el código enviado a tu correo</label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                value={codigoIngresado}
                onChange={e => setCodigoIngresado(e.target.value)}
                placeholder="Código de 6 dígitos"
                required
              />
            </div>
            {debugCode && (
              <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>
                (Simulación: tu código es <b>{debugCode}</b>)
              </div>
            )}
            <button type="submit" className="btn-login">
              Verificar código
            </button>
            {error && <div style={{ color: '#e74c3c', marginTop: 10 }}>{error}</div>}
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetSubmit}>
            <div className="input-group">
              <label htmlFor="newpass">Nueva contraseña</label>
              <input
                type="password"
                id="newpass"
                name="newpass"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña (mín 6 caracteres)"
                required
              />
            </div>
            <button type="submit" className="btn-login">Cambiar contraseña</button>
            {error && <div style={{ color: '#e74c3c', marginTop: 10 }}>{error}</div>}
          </form>
        )}

        {step === 4 && (
          <div style={{ color: '#27ae60', marginTop: 20, fontWeight: 600, fontSize: 16 }}>
            Contraseña cambiada con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.
          </div>
        )}
        <div className="extra" style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href="#" onClick={e => {e.preventDefault(); setView && setView('login');}} style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:18}}>←</span> Volver al inicio de sesión
          </a>
          
        
        </div>
      </div>
    </>
  );
}
