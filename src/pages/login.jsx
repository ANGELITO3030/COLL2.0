import { useState } from "react";

export default function Login({ setView }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleRegisterChange = (e) => {
      setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setError("");
      if (form.email && form.password) {
        if (setView) {
          let nextView = null;
          let nombre = "";
          if (form.email === "admin@collservice.com") {
            if (form.password === "admin123") {
              nextView = "admin";
              nombre = "Administrador";
            } else {
              setError("Contraseña incorrecta para administrador");
              return;
            }
          } else if (form.email === "empleada@collservice.com") {
            if (form.password === "empleada123") {
              nextView = "empleado";
              nombre = "Empleada";
            } else {
              setError("Contraseña incorrecta para empleada");
              return;
            }
          } else if (form.email === "cliente@collservice.com" && form.password === "cliente123") {
            nextView = "cliente";
            nombre = "Cliente";
          } else {
            setError("Correo o contraseña incorrectos");
            return;
          }
          setSuccessMsg(`¡Bienvenido/a ${nombre}! Redirigiendo...`);
          setTimeout(() => {
            setSuccessMsg("");
            setView(nextView);
          }, 1200);
        } else {
          setError("No se pudo cambiar de vista. Prop setView no disponible.");
        }
      } else {
        setError("Completa todos los campos");
      }
    };

    const handleRegister = (e) => {
      e.preventDefault();
      setError("");
      if (registerForm.email && registerForm.password) {
        if (setView) {
          setView("cliente");
        } else {
          setError("No se pudo cambiar de vista. Prop setView no disponible.");
        }
      } else {
        setError("Completa todos los campos para registrarte");
      }
    };

    return (
      <>
        <style>{`.login-container { background: white; padding: 35px 40px; border-radius: 10px; box-shadow: 0 6px 12px rgba(0,0,0,0.1); width: 380px; text-align: center; border-top: 6px solid #e76bb2; } .login-container h2 { margin-bottom: 20px; color: #e76bb2; font-size: 26px; font-weight: bold; } .input-group { margin-bottom: 18px; text-align: left; } .input-group label { display: block; font-size: 14px; margin-bottom: 6px; color: #444; } .input-group input { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ccc; font-size: 14px; transition: border 0.3s; } .input-group input:focus { border-color: #a18cd1; outline: none; } .btn-login { width: 100%; padding: 12px; background: linear-gradient(90deg, #fbc2eb, #a18cd1); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; transition: opacity 0.3s; } .btn-login:hover { opacity: 0.9; } .extra { margin-top: 20px; font-size: 14px; color: #555; } .extra a { color: #e76bb2; text-decoration: none; font-weight: bold; } .extra a:hover { text-decoration: underline; }`}</style>
        <div className="login-container">
          {!showRegister ? (
            <>
              <h2>Iniciar Sesión</h2>
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
                <div className="input-group">
                  <label htmlFor="password">Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Tu contraseña"
                      required
                      style={{ paddingRight: 38 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#a18cd1',
                        cursor: 'pointer',
                        fontSize: 16,
                        padding: 0
                      }}
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-login">
                  Ingresar
                </button>
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <a href="#" style={{ color: '#a18cd1', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={e => { e.preventDefault(); setView && setView('recuperar'); }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                {error && <div style={{ color: '#e74c3c', marginTop: 10 }}>{error}</div>}
                {successMsg && <div style={{ color: '#27ae60', marginTop: 10, fontWeight: 600, fontSize: 16 }}>{successMsg}</div>}
              </form>
              <p className="extra">
                ¿No tienes cuenta? <a href="#" onClick={e => {e.preventDefault(); setShowRegister(true);}}>Regístrate aquí</a>
              </p>
            </>
          ) : (
            <>
              <h2>Registro</h2>
              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label htmlFor="reg-email">Correo electrónico</label>
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder="Ej: usuario@email.com"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="reg-password">Contraseña</label>
                  <input
                    type="password"
                    id="reg-password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Crea una contraseña"
                    required
                  />
                </div>
                <button type="submit" className="btn-login">
                  Registrarme
                </button>
                {error && <div style={{ color: '#e74c3c', marginTop: 10 }}>{error}</div>}
              </form>
              <p className="extra">
                ¿Ya tienes cuenta? <a href="#" onClick={e => {e.preventDefault(); setShowRegister(false);}}>Inicia sesión aquí</a>
              </p>
            </>
          )}
        </div>
      </>
    );
}
