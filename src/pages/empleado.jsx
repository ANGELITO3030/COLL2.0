
import React, { useState } from "react";

function Empleado() {
  // Simulación de datos del empleado logueado
  const [empleado] = useState({
    nombre: "María López",
    foto: "/lav.png",
    especialidad: "Limpieza general",
    telefono: "3001234567",
    correo: "maria@collservice.com",
    descripcion: "Empleada con 5 años de experiencia en limpieza de hogares y oficinas. Responsable, puntual y de confianza.",
    servicios: [
      "Limpieza profunda",
      "Organización de espacios",
      "Cuidado de mascotas"
    ],
    calificacion: 4.8,
    comentarios: [
      { usuario: "Cliente1", texto: "Muy profesional y amable." },
      { usuario: "Cliente2", texto: "Dejó mi casa impecable." }
    ]
  });

  // Simulación de solicitudes de trabajo nuevas
  const [solicitudes, setSolicitudes] = useState([
    {
      cliente: "Laura Pérez",
      fecha: "2025-09-09",
      servicio: "Limpieza profunda de apartamento",
      direccion: "Cra 45 #12-34, Medellín",
      mensaje: "Necesito limpieza general y organización de closets."
    },
    {
      cliente: "Carlos Ruiz",
      fecha: "2025-09-08",
      servicio: "Cuidado de mascotas y limpieza",
      direccion: "Cll 10 #20-30, Envigado",
      mensaje: "Limpieza y cuidado de dos gatos durante la tarde."
    }
  ]);
  const [anuncio, setAnuncio] = useState("");
  const [enRevision, setEnRevision] = useState([]);

  const handleAceptar = (idx) => {
    setAnuncio("Su solicitud estará en revisión");
    setEnRevision(arr => [...arr, solicitudes[idx]]);
    setSolicitudes(arr => arr.filter((_, i) => i !== idx));
    setTimeout(() => setAnuncio(""), 2500);
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #e6e6f5", padding: 28 }}>
      <div style={{ marginBottom: 18, textAlign: 'center' }}>
        <span style={{ color: '#fff', background: '#e76bb2', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 16, letterSpacing: 1 }}>Bienvenida Empleada</span>
      </div>
      <h2 style={{ color: "#4c3575", marginBottom: 18 }}>Panel de Empleado</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 18 }}>
        <img src={empleado.foto} alt={empleado.nombre} style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid #e76bb2" }} />
        <div>
          <h3 style={{ color: "#e76bb2", margin: 0 }}>{empleado.nombre}</h3>
          <div style={{ color: "#4c3575", fontWeight: 500 }}>{empleado.especialidad}</div>
          <div style={{ fontSize: 13, color: "#555" }}>Tel: {empleado.telefono}</div>
          <div style={{ fontSize: 13, color: "#555" }}>Email: {empleado.correo}</div>
        </div>
      </div>

      {/* Proceso de solicitudes en revisión */}
      {enRevision.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#4c3575', marginBottom: 8 }}>Solicitudes en revisión</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {enRevision.map((s, i) => (
              <li key={i} style={{ background: '#fffbe6', borderRadius: 10, marginBottom: 10, padding: 12, boxShadow: '0 1px 4px #eee', border: '1px solid #ffe58f' }}>
                <div style={{ fontWeight: 600, color: '#e76bb2' }}>{s.cliente} <span style={{ fontWeight: 400, color: '#888', fontSize: 13 }}>({s.fecha})</span></div>
                <div style={{ color: '#4c3575', fontWeight: 500 }}>{s.servicio}</div>
                <div style={{ fontSize: 13, color: '#555' }}>Dirección: {s.direccion}</div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Mensaje: {s.mensaje}</div>
                <div style={{ color: '#b8860b', fontWeight: 500 }}>Estado: En revisión</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sección de solicitudes nuevas */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ color: "#e76bb2", marginBottom: 10 }}>Solicitudes de trabajo nuevas</h3>
        {anuncio && (
          <div style={{ background: '#e76bb2', color: 'white', borderRadius: 8, padding: '10px 18px', marginBottom: 12, textAlign: 'center', fontWeight: 500 }}>
            {anuncio}
          </div>
        )}
        {solicitudes.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic' }}>No hay solicitudes nuevas.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {solicitudes.map((s, i) => (
              <li key={i} style={{ background: '#f6f5fc', borderRadius: 10, marginBottom: 14, padding: 14, boxShadow: '0 1px 4px #eee' }}>
                <div style={{ fontWeight: 600, color: '#4c3575' }}>{s.cliente} <span style={{ fontWeight: 400, color: '#888', fontSize: 13 }}>({s.fecha})</span></div>
                <div style={{ color: '#e76bb2', fontWeight: 500 }}>{s.servicio}</div>
                <div style={{ fontSize: 13, color: '#555' }}>Dirección: {s.direccion}</div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Mensaje: {s.mensaje}</div>
                <button onClick={() => handleAceptar(i)} style={{ background: '#4c3575', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: 600 }}>Aceptar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginBottom: 18 }}>
        <strong>Descripción:</strong>
        <div style={{ color: "#444", marginTop: 4 }}>{empleado.descripcion}</div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <strong>Servicios que ofrece:</strong>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#4c3575" }}>
          {empleado.servicios.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div style={{ marginBottom: 18 }}>
        <strong>Calificación promedio:</strong> <span style={{ color: "#e76bb2", fontWeight: 600 }}>{empleado.calificacion} / 5</span>
      </div>
      <div>
        <strong>Comentarios de clientes:</strong>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#555" }}>
          {empleado.comentarios.map((c, i) => <li key={i}><b>{c.usuario}:</b> {c.texto}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default Empleado;
