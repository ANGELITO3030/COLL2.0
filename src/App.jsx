import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importa todas las páginas/vistas que usarás
import Login from "./pages/login.jsx";
import Terminos from "./pages/terminos.jsx";
import Privacidad from "./pages/privacidad.jsx";
import DatosPersonales from "./pages/datos.jsx";
import RegistroEmpleado from "./pages/registro.jsx";
import RegistroCliente from "./pages/recliente.jsx";
import Cliente from "./pages/cliente.jsx";
import Admin from "./pages/admin.jsx";
import Empleado from "./pages/empleado.jsx";
import Nosotros from "./pages/nosotros.jsx";
import ContactoEmpresaInfo from "./pages/contacto.jsx";
import RecuperarContrasena from "./pages/recuperarContrasena.jsx";
import Perfiles from "./pages/perfiles.jsx";
import ChatPage from "./pages/chat.jsx";
import AdminChatSupervision from "./pages/chatAdmin.jsx";
import Header from "./components/Header";

// 👉 Nuevo componente Servicios (sin cambios funcionales)
function Servicios({ goBack }) {
  return (
    <section style={{ textAlign: "center", padding: "20px" }}>
      <h2 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "16px" }}>
        Nuestros Servicios
      </h2>
      <p style={{ marginBottom: "20px", fontSize: "16px" }}>
        Ofrecemos limpieza de hogares, oficinas, organización de espacios y
        mantenimiento general.
      </p>
      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          listStyle: "none",
          padding: 0,
        }}
      >
        <li style={servicioStyle}>🧹 Limpieza general</li>
        <li style={servicioStyle}>🧺 Lavandería</li>
        <li style={servicioStyle}>🍲 Preparación de alimentos</li>
        <li style={servicioStyle}>👵 Cuidado de adultos mayores</li>
        <li style={servicioStyle}>👶 Niñera</li>
        <li style={servicioStyle}>🐶 Cuidado canino</li>
        <li style={servicioStyle}>🌳 Mantenimiento de jardines y áreas verdes</li>
        <li style={servicioStyle}>🗄 Organización de armarios o bodegas</li>
        <li style={servicioStyle}>🛒 Compras y mandados</li>
        <li style={servicioStyle}>♿ Cuidado a personas con discapacidad</li>
        <li style={servicioStyle}>🎉 Limpieza después de eventos o fiestas</li>
        <li style={servicioStyle}>🚗 Limpieza y mantenimiento de vehículos</li>
      </ul>
      {goBack && (
        <button
          onClick={goBack}
          style={{
            marginTop: "20px",
            background: "#ecafd2ff",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ⬅ Volver
        </button>
      )}
    </section>
  );
}

const servicioStyle = {
  background: "#ffe4ec",
  padding: "14px",
  borderRadius: "12px",
  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
  fontWeight: "500",
  textAlign: "center",
};

function App() {
  const [view, setView] = useState("inicio");
  const [history, setHistory] = useState([]);
  const [rol, setRol] = useState("");
  const [user, setUser] = useState({ name: "", role: "", token: "" }); // guarda el usuario real
  const [isMobile, setIsMobile] = useState(false);
  const [carruselIdx, setCarruselIdx] = useState(0);

  // Mantener rol legible en 'rol' (compatibilidad con tu código existente)
  useEffect(() => {
    if (user && user.role) {
      if (user.role === "admin") setRol("Administrador");
      else if (user.role === "empleado") setRol("Empleada");
      else if (user.role === "cliente") setRol("Cliente");
      else setRol("");
    } else {
      setRol("");
    }
  }, [user]);

  const goToView = (v) => {
    setHistory((h) => [...h, view]);
    setView(v);
  };

  const goBack = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setView(prev);
      return h.slice(0, -1);
    });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const carruselImgs = [
    { src: "/lav.png", alt: "Empleada limpiando cocina", texto: "Limpieza de cocinas y baños" },
    { src: "/can.png", alt: "Empleada con productos de limpieza", texto: "Personal capacitado y amable" },
    { src: "/nin.png", alt: "Empleada cuidando niños", texto: "Cuidado y confianza para tu familia" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCarruselIdx((i) => (i + 1) % carruselImgs.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Header handlers para pasar al componente Header
  const handleLoginClick = () => goToView("login");
  const handleRegisterClick = () => goToView("registro");
  const handleLogout = () => {
    setUser({ name: "", role: "", token: "" });
    setRol("");
    goToView("inicio");
  };

  const renderView = () => {
    switch (view) {
      case "login":
        return (
          <Login
            setView={(v) => goToView(v)}
            setUser={setUser} // pasamos setUser para guardar nombre/rol/token desde Login
          />
        );
      case "recuperar":
        return <RecuperarContrasena setView={goToView} goBack={goBack} />;
      case "registro":
        return <RegistroEmpleado goBack={goBack} />;
      case "recliente":
        return <RegistroCliente goBack={goBack} />;
      case "cliente":
        return <Cliente goBack={goBack} />;
      case "empleado":
        return <Empleado goBack={goBack} />;
      case "admin":
        return <Admin goBack={goBack} />;
      case "servicios":
        return <Servicios goBack={goBack} />;
      case "nosotros":
        return <Nosotros goBack={goBack} />;
      case "contacto":
        return <ContactoEmpresaInfo goBack={goBack} />;
      case "terminos":
        return <Terminos goBack={goBack} />;
      case "privacidad":
        return <Privacidad goBack={goBack} />;
      case "datos":
        return <DatosPersonales goBack={goBack} />;
      default:
        return null;
    }
  };

  // Estilos para centrar contenido general de las páginas (Inicio ya tiene su propio layout)
  const contentContainer = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 20px",
    boxSizing: "border-box",
    textAlign: "center",
  };

  return (
    <Router>
      <div style={{ fontFamily: '"Segoe UI", Arial, sans-serif', backgroundColor: "#f6f5fc", color: "#333", lineHeight: "1.5" }}>
        {/* Header componente que ahora usa user real y permite navegar al 'inicio', 'servicios', 'contacto', 'nosotros' */}
        <Header
          user={user}
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
          onLogout={handleLogout}
          onNavigate={(v) => goToView(v)}
        />

        <main>
          {view === "inicio" ? (
            <>
              {/* Inicio centrado: en pantallas grandes muestra texto y carrusel lado a lado centrados,
                  en pantallas pequeñas apila verticalmente y centra todo */}
              <section
                style={{
                  position: "relative",
                  padding: "60px 20px",
                  background: "linear-gradient(135deg, rgba(251,194,235,0.95), rgba(76,53,117,0.95))",
                  color: "white",
                  textAlign: "center",
                  minHeight: "calc(100vh - 160px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "40px",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <div style={{ flex: "1", maxWidth: isMobile ? "100%" : 520, textAlign: "center" }}>
                  <h1 style={{ fontSize: isMobile ? "32px" : "42px", marginBottom: "18px", fontWeight: "bold" }}>
                    Servicio de limpieza de casas y apartamentos que se adapta a ti
                  </h1>
                  <p style={{ fontSize: isMobile ? "16px" : "18px", lineHeight: "1.6", marginBottom: "26px" }}>
                    En Coll Service entendemos que tu hogar no es cualquier lugar: es tu refugio, tu energía, tu espacio sagrado.
                    Nuestro servicio de limpieza va más allá de lo básico: es una experiencia diseñada para darte tranquilidad,
                    confianza y resultados impecables.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      style={{
                        background: "#e76bb2",
                        color: "white",
                        padding: "14px 28px",
                        borderRadius: "25px",
                        border: "none",
                        fontSize: "16px",
                        fontWeight: "700",
                        cursor: "pointer",
                        boxShadow: "0 6px 20px rgba(231,107,178,0.25)",
                      }}
                      onClick={() => goToView("registro")}
                    >
                      AGENDA TU LIMPIEZA AHORA
                    </button>
                  </div>
                </div>

                <div style={{ flex: "1", maxWidth: isMobile ? "100%" : 560, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      height: isMobile ? 260 : 400,
                      borderRadius: "20px",
                      overflow: "hidden",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                      background: "#fff",
                      position: "relative",
                    }}
                  >
                    <img
                      src={carruselImgs[carruselIdx].src}
                      alt={carruselImgs[carruselIdx].alt}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "opacity 0.7s",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(76,53,117,0.85)",
                        color: "white",
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {carruselImgs[carruselIdx].texto}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    {carruselImgs.map((_, i) => (
                      <span
                        key={i}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: i === carruselIdx ? "#e76bb2" : "rgba(255,255,255,0.6)",
                          cursor: "pointer",
                          transition: "background 0.25s",
                          border: "2px solid rgba(0,0,0,0.12)",
                        }}
                        onClick={() => setCarruselIdx(i)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            // Para todas las demás vistas, centramos el contenido en un contenedor con max-width
            <div style={contentContainer}>{renderView()}</div>
          )}
        </main>

        <footer
          style={{
            background: "linear-gradient(90deg, #fbc2eb, #4c3575)",
            color: "white",
            padding: "30px 20px",
            textAlign: "center",
            marginTop: "0",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <a
              style={{ color: "white", textDecoration: "underline", cursor: "pointer", margin: "0 8px" }}
              onClick={() => goToView("terminos")}
            >
              Términos y Condiciones
            </a>
            |
            <a
              style={{ color: "white", textDecoration: "underline", cursor: "pointer", margin: "0 8px" }}
              onClick={() => goToView("privacidad")}
            >
              Política de Privacidad
            </a>
            |
            <a
              style={{ color: "white", textDecoration: "underline", cursor: "pointer", margin: "0 8px" }}
              onClick={() => goToView("datos")}
            >
              Datos Personales
            </a>
          </div>
          <div style={{ marginTop: "20px", marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "30px" }}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: "white", 
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px"
              }}
            >
              <img src="/insta.png" alt="Instagram" style={{ width: "24px", height: "24px" }} /> Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: "white", 
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px"
              }}
            >
              
              <img src="/face.png" alt="Facebook" style={{ width: "24px", height: "24px" }} /> Facebook
            </a>

                 <a
              href="https://wa.me/573014567890"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: "white", 
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px"
              }}
            >
              
              <img src="/whatsapp.png" alt="WhatsApp" style={{ width: "24px", height: "24px" }} /> WhatsApp
            </a>
           
            
          </div>
          <div style={{ fontWeight: "500", fontSize: "16px" }}>© {new Date().getFullYear()} Coll Service. Todos los derechos reservados.</div>
        </footer>
      </div>

     
    </Router>
  );
}

export default App;