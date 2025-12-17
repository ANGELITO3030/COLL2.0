import { useState } from "react";
import axios from "axios";
import { FiMail, FiLock, FiKey, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

export default function RecuperarContrasena({ setView }) {
  const [form, setForm] = useState({ email: "" });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [debugCode, setDebugCode] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email) return setError("Por favor ingresa tu correo electrónico.");
    try {
      const res = await axios.post("http://localhost:5000/api/password/recover", { email: form.email });
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
    
    if (!newPassword || !confirmPassword) {
      return setError("Ambos campos de contraseña son requeridos");
    }
    
    if (newPassword.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }
    
    if (newPassword !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }
    
    try {
      await axios.post("http://localhost:5000/api/password/reset", { 
        email: form.email, 
        code: codigoIngresado, 
        newPassword,
        confirmPassword
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña");
    }
  };

  return (
    <>
      <style>{`
        .recovery-container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 12px 28px rgba(235, 107, 178, 0.12);
          width: 420px;
          text-align: center;
          position: relative;
          overflow: hidden;
          margin: 40px auto;
          border: 1px solid rgba(235, 107, 178, 0.1);
        }

        .recovery-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #fbc2eb, #a18cd1, #e76bb2);
        }

        .recovery-header {
          margin-bottom: 30px;
          position: relative;
        }

        .recovery-header h2 {
          color: #e76bb2;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .recovery-subtitle {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          max-width: 320px;
          margin: 0 auto;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 30px;
          position: relative;
        }

        .step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #999;
          font-size: 14px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .step-dot.active {
          background: linear-gradient(135deg, #fbc2eb, #a18cd1);
          color: white;
          box-shadow: 0 4px 12px rgba(235, 107, 178, 0.25);
        }

        .step-dot.completed {
          background: #27ae60;
          color: white;
        }

        .step-line {
          position: absolute;
          top: 16px;
          left: 50px;
          right: 50px;
          height: 2px;
          background: linear-gradient(90deg, 
            #fbc2eb 0%, 
            #a18cd1 50%, 
            #f0f0f0 50%
          );
          z-index: 0;
        }

        .input-group {
          margin-bottom: 24px;
          text-align: left;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid #e1e1e1;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .input-field:focus {
          border-color: #a18cd1;
          background: white;
          box-shadow: 0 0 0 4px rgba(161, 140, 209, 0.1);
          outline: none;
        }

        .input-field:hover {
          border-color: #c9b6e6;
        }

        .btn-recovery {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #fbc2eb, #a18cd1);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .btn-recovery:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(235, 107, 178, 0.3);
        }

        .btn-recovery:active {
          transform: translateY(0);
        }

        .error-message {
          background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(231, 76, 60, 0.05));
          color: #e74c3c;
          padding: 12px 16px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: left;
          font-size: 14px;
          border-left: 4px solid #e74c3c;
        }

        .success-message {
          padding: 30px 20px;
          text-align: center;
        }

        .success-icon {
          font-size: 48px;
          color: #27ae60;
          margin-bottom: 20px;
          animation: scaleIn 0.5s ease;
        }

        .success-text {
          color: #27ae60;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.6;
        }

        .back-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #e76bb2;
          text-decoration: none;
          font-weight: 600;
          margin-top: 30px;
          padding: 12px;
          border-radius: 10px;
          transition: all 0.3s ease;
          background: rgba(235, 107, 178, 0.05);
        }

        .back-link:hover {
          background: rgba(235, 107, 178, 0.1);
          transform: translateX(-4px);
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .form-animation {
          animation: slideIn 0.4s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="recovery-container">
        <div className="recovery-header">
          <h2>Recuperar Contraseña</h2>
          <p className="recovery-subtitle">
            {step === 1 && "Te enviaremos un código de verificación a tu correo electrónico"}
            {step === 2 && "Ingresa el código de 6 dígitos que recibiste"}
            {step === 3 && "Crea una nueva contraseña segura para tu cuenta"}
            {step === 4 && "¡Listo! Tu contraseña ha sido actualizada exitosamente"}
          </p>
        </div>

        <div className="step-indicator">
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            1
          </div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            2
          </div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            3
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="form-animation">
            <div className="input-group">
              <label className="input-label">
                <FiMail /> Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="input-field"
                required
              />
            </div>
            
            <button type="submit" className="btn-recovery">
              <FiMail /> Enviar código de verificación
            </button>
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handleCodigoSubmit} className="form-animation">
            <div className="input-group">
              <label className="input-label">
                <FiKey /> Código de verificación
              </label>
              <input
                type="text"
                value={codigoIngresado}
                onChange={e => setCodigoIngresado(e.target.value)}
                placeholder="123456"
                className="input-field"
                maxLength="6"
                required
              />
              <small style={{ color: '#888', marginTop: 8, display: 'block' }}>
                Ingresa el código de 6 dígitos enviado a tu correo
              </small>
            </div>
            
            <button type="submit" className="btn-recovery">
              <FiCheckCircle /> Verificar código
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetSubmit} className="form-animation">
            <div className="input-group">
              <label className="input-label">
                <FiLock /> Nueva contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="input-field"
                required
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">
                <FiLock /> Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="input-field"
                required
              />
            </div>
            
            <button type="submit" className="btn-recovery">
              <FiLock /> Cambiar contraseña
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="success-message form-animation">
            <div className="success-icon">
              <FiCheckCircle />
            </div>
            <p className="success-text">
              ¡Contraseña cambiada con éxito!<br />
              Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>
        )}

        {error && (
          <div className="error-message form-animation">
            {error}
          </div>
        )}

        <a 
          href="#" 
          onClick={e => {e.preventDefault(); setView && setView('login');}} 
          className="back-link"
        >
          <FiArrowLeft /> Volver al inicio de sesión
        </a>
      </div>
    </>
  );
}