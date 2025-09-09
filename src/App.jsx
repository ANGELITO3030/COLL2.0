import React, { useState } from "react";
import Login from "./pages/login.jsx";
import Cliente from "./pages/cliente.jsx";
import Perfiles from "./pages/perfiles.jsx";
import Nosotros from "./pages/nosotros.jsx";
import Admin from "./pages/admin.jsx";
import Empleado from "./pages/empleado.jsx";
import RecuperarContrasena from "./pages/recuperarContrasena.jsx";

      function App() {
        const [view, setView] = useState("inicio");
        const [rol, setRol] = useState("");
        // Carrusel: hooks deben estar aquí, no dentro de renderView
        const carruselImgs = [
          { src: "/lav.png", alt: "Empleada limpiando cocina", texto: "Limpieza de cocinas y baños" },
          { src: "/can.png", alt: "Empleada con productos de limpieza", texto: "Personal capacitado y amable" },
          { src: "/nin.png", alt: "Empleada cuidando niños", texto: "Cuidado y confianza para tu familia" }
        ];
        const [carruselIdx, setCarruselIdx] = useState(0);
        React.useEffect(() => {
          const timer = setInterval(() => setCarruselIdx(i => (i + 1) % carruselImgs.length), 3500);
          return () => clearInterval(timer);
        }, []);

        // --- ESTILOS ---
        const headerStyle = {
          background: 'linear-gradient(90deg, #fbc2eb, #4c3575)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 30px',
        };
        const logoStyle = { fontSize: '22px', fontWeight: 'bold' };
        const menuStyle = { listStyle: 'none', display: 'flex', gap: '25px', margin: 0, padding: 0 };
        const menuLinkStyle = { textDecoration: 'none', color: 'white', fontWeight: '500', transition: 'color 0.3s', cursor: 'pointer' };
        const accionesStyle = { display: 'flex', alignItems: 'center', gap: '6px' };
        const inputStyle = { padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '14px' };
        const buscarBtnStyle = { background: '#ff69b4', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontWeight: 'bold' };
        const btnStyle = { background: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#333', transition: 'background 0.3s' };
        const bienvenidaStyle = { textAlign: 'center', margin: '50px auto 30px' };
        const bienvenidaH1Style = { fontSize: '30px', color: '#e76bb2', marginBottom: '15px' };
        const bienvenidaPStyle = { fontSize: '16px', background: '#f1f2f7', display: 'inline-block', padding: '10px 18px', borderRadius: '10px', color: '#444' };
        const descripcionStyle = { maxWidth: '850px', margin: '0 auto 50px', background: 'white', padding: '25px 30px', borderRadius: '16px', boxShadow: '0 6px 12px rgba(0,0,0,0.1)', textAlign: 'center' };
        const descripcionPStyle = { marginBottom: '20px', fontSize: '15px', color: '#555' };
        const razonesH3Style = { fontSize: '18px', color: '#333', marginBottom: '15px', fontWeight: 'bold' };
        const opcionesStyle = { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' };
        const tagStyle = { background: 'linear-gradient(90deg, #fbc2eb, #4c3575)', color: 'white', padding: '8px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', boxShadow: '0 3px 6px rgba(0,0,0,0.1)' };

        const renderView = () => {
          console.log("Vista actual:", view);
          switch (view) {
            case "login":
              return <Login setView={(v) => {
                setView(v);
                // Determinar rol según vista
                if (v === "admin") setRol("Administrador");
                else if (v === "empleado") setRol("Empleada");
                else if (v === "cliente") setRol("Cliente");
                else setRol("");
              }} />;
            case "recuperar":
              return <RecuperarContrasena setView={setView} />;
            case "cliente":
              return <Cliente />;
            case "perfiles":
              return <Perfiles />;
            case "nosotros":
              return <Nosotros />;
            case "admin":
              return <Admin />;
            case "empleado":
              return <Empleado />;
            default:
              return (
                <>
                  <section style={{ ...bienvenidaStyle, marginBottom: 0 }}>
                    <h1 style={bienvenidaH1Style}>Bienvenido a Coll Service</h1>
                    <p style={bienvenidaPStyle}>
                      Tu tranquilidad y limpieza en manos expertas. ¡Confía en nosotros para tu hogar u oficina!
                    </p>
                  </section>
                  {/* Carrusel visual */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto 40px', maxWidth: 500 }}>
                    <div style={{ position: 'relative', width: 320, height: 200, borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 16px rgba(76,53,117,0.13)', background: '#fff' }}>
                      <img src={carruselImgs[carruselIdx].src} alt={carruselImgs[carruselIdx].alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.7s' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(76,53,117,0.7)', color: 'white', padding: '10px 0', textAlign: 'center', fontWeight: 500, fontSize: 17, letterSpacing: 0.5 }}>{carruselImgs[carruselIdx].texto}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      {carruselImgs.map((_, i) => (
                        <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i === carruselIdx ? '#e76bb2' : '#ddd', display: 'inline-block', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                  </div>
                  <section style={descripcionStyle}>
                    <p style={descripcionPStyle}>
                      En Coll Service ofrecemos servicios profesionales de aseo doméstico para hogares y oficinas.
                      Nuestro equipo está capacitado para brindar limpieza, organización y confianza en cada visita.
                    </p>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={razonesH3Style}>¿Por qué elegirnos?</h3>
                      <div style={opcionesStyle}>
                        <span style={tagStyle}>Personal confiable y verificado</span>
                        <span style={tagStyle}>Atención personalizada</span>
                      </div>
                    </div>
                  </section>
                </>
              );
          }
        };

        return (
          <div style={{ fontFamily: '"Segoe UI", Arial, sans-serif', backgroundColor: '#f6f5fc', color: '#333', lineHeight: '1.5' }}>
            <header style={headerStyle}>
              <a href="#" onClick={e => {e.preventDefault(); setView('inicio'); setRol && setRol('');}} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img src="/logo.png.png" alt="Coll Service Logo" style={{ height: '80px', marginRight: 10, cursor: 'pointer' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1.5px', color: '#fff', marginLeft: 0, alignSelf: 'flex-start' }}>COLL SERVICE</span>
              </a>
              <ul style={menuStyle}>
                <li><a style={menuLinkStyle} onClick={() => setView("inicio")}>Inicio</a></li>
                <li><a style={menuLinkStyle} onClick={() => setView("servicios")}>Servicios</a></li>
                <li><a style={menuLinkStyle} onClick={() => setView("nosotros")}>Nosotros</a></li>
                <li><a style={menuLinkStyle} onClick={() => setView("contacto")}>Contacto</a></li>
                <li><a style={menuLinkStyle} onClick={() => setView("perfiles")}>Perfiles</a></li>
              </ul>
              <div style={accionesStyle}>
                {rol && (
                  <>
                    <span style={{ color: '#fff', fontWeight: 600, background: '#e76bb2', borderRadius: 8, padding: '6px 16px', marginRight: 12, fontSize: 15, letterSpacing: 1 }}>Bienvenido {rol}</span>
                    <button style={{ ...btnStyle, background: '#e76bb2', color: 'white' }} onClick={() => { setView('inicio'); setRol(''); }}>Cerrar sesión</button>
                  </>
                )}
                {!rol && <button style={btnStyle} onClick={() => { setView("login"); setRol(""); }}>Iniciar sesión</button>}
                <button style={btnStyle}>Registrarse</button>
              </div>
            </header>

            <main>
              {renderView()}
            </main>

            <footer
              style={{
                background: 'linear-gradient(90deg, #fbc2eb, #4c3575)',
                color: 'white',
                padding: '30px 20px',
                textAlign: 'center',
                marginTop: '60px'
              }}
            >
              <div style={{ marginBottom: '10px', fontWeight: '500', fontSize: '16px' }}>
                © {new Date().getFullYear()} Coll Service. Todos los derechos reservados.
              </div>
            </footer>
          </div>
        );
      }

      export default App;
