import React from "react";
import ChatLauncher from "./ChatLauncher";

/**
 * Header actualizado:
 * Props:
 * - user: { name, role } (si hay sesión, user.name se muestra)
 * - onLoginClick() => abre vista de login
 * - onRegisterClick() => abre vista de registro
 * - onLogout() => limpia sesión
 * - onNavigate(viewName) => navegar internamente con goToView
 */
export default function Header({ user = { name: "", role: "" }, onLoginClick, onRegisterClick, onLogout, onNavigate }) {
  const isLogged = Boolean(user && user.name);

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: 600,
    marginRight: 18,
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        background: "linear-gradient(90deg, #f7c3e4, #6e4a78)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (typeof onNavigate === "function") onNavigate("inicio");
          }}
          style={{
            color: "#fff",
            fontWeight: 800,
            textDecoration: "none",
            fontSize: "1.15rem",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img src="/logo.png.png" alt="COLL SERVICE" style={{ height: 44 }} />
          COLL SERVICE
        </a>

        {/* Menú principal (usa onNavigate para integrarse con goToView de App) */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <a
            href="#"
            style={linkStyle}
            onClick={(e) => {
              e.preventDefault();
              if (typeof onNavigate === "function") onNavigate("inicio");
            }}
          >
            
          </a>
          <a
            href="#"
            style={linkStyle}
            onClick={(e) => {
              e.preventDefault();
              if (typeof onNavigate === "function") onNavigate("servicios");
            }}
          >
            Nuestros Servicios
          </a>
          <a
            href="#"
            style={linkStyle}
            onClick={(e) => {
              e.preventDefault();
              if (typeof onNavigate === "function") onNavigate("contacto");
            }}
          >
            Contáctanos
          </a>
          <a
            href="#"
            style={linkStyle}
            onClick={(e) => {
              e.preventDefault();
              if (typeof onNavigate === "function") onNavigate("nosotros");
            }}
          >
            Sobre Nosotros
          </a>
        </nav>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <ChatLauncher defaultEmployee={{ id: "servicio", nombre: "Servicio de limpieza" }} />

        {isLogged ? (
          <>
            <button
              style={{
                background: "#f09abf",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "default",
                fontWeight: 700,
              }}
              title={user.role || ""}
            >
              {`Bienvenido ${user.name}`}
            </button>

            <button
              onClick={() => {
                if (typeof onLogout === "function") onLogout();
              }}
              style={{
                background: "#f09abf",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (typeof onLoginClick === "function") onLoginClick();
              }}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => {
                if (typeof onRegisterClick === "function") onRegisterClick();
              }}
              style={{
                background: "#f09abf",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              AGENDA TU LIMPIEZA
            </button>
          </>
        )}
      </div>
    </header>
  );
}