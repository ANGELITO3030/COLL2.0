import React, { useEffect, useState } from "react";
import StarRating from "../components/StarRating";
import { useNavigate } from "react-router-dom";

export default function Empleado() {
  const navigate = useNavigate();
  const [empleado] = useState({
    nombre: "María López",
    id: "e1",
    foto: "/lav.png",
    especialidad: "Limpieza general",
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

  const NOTIF_KEY = "notifications";
  const [notificaciones, setNotificaciones] = useState([]);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY) || "[]";
      const all = JSON.parse(raw);
      if (!Array.isArray(all)) throw new Error("notifications must be an array");
      const mine = all.filter(n => n && n.employeeId === empleado.id && !n.read).sort((a,b)=> b.time - a.time);
      setNotificaciones(mine);
    } catch (err) {
      console.error("Error leyendo notificaciones:", err);
      setLoadError(err.message || String(err));
      setNotificaciones([]);
    }
  }, [empleado.id]);

  const openNotification = (n) => {
    try {
      // marcar leida
      const raw = localStorage.getItem(NOTIF_KEY) || "[]";
      const all = JSON.parse(raw);
      const updated = all.map(item => item && item.id === n.id ? { ...item, read: true } : item);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    } catch (e) { console.warn("no se pudo marcar notificación:", e); }

    // navegar al chat pasando client info y role=empleada
    navigate("/chat", { state: { employee: { id: empleado.id, nombre: empleado.nombre }, client: { id: n.clientId, nombre: n.clientName }, role: "empleada" } });
  };

  const markAllRead = () => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY) || "[]";
      const all = JSON.parse(raw);
      const updated = all.map(item => item && item.employeeId === empleado.id ? { ...item, read: true } : item);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
      setNotificaciones([]);
    } catch (e) { console.warn(e); }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "24px auto", padding: 18 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", background: "#fff", padding: 18, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
        <img src={empleado.foto} alt={empleado.nombre} style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, color: "#c2185b" }}>{empleado.nombre}</h1>
          <div style={{ color: "#666", marginTop: 6 }}>{empleado.especialidad}</div>
          <p style={{ marginTop: 12, color: "#333" }}>{empleado.descripcion}</p>

          <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ background: "#f7f2f8", color: "#c2185b", padding: "6px 10px", borderRadius: 16, fontWeight: 700 }}>{empleado.especialidad}</div>
            <div style={{ color: "#444" }}>Calificación: <strong style={{ marginRight: 8 }}>
              <StarRating employeeId={empleado.id} />
            </strong></div>
            <div style={{ marginLeft: "auto" }}>
              <button style={{ background: "#e76bb2", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>Solicitar servicio</button>
            </div>
          </div>

          <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #f0e9f2" }} />

          <div>
            <h3 style={{ margin: "6px 0 12px 0", color: "#4c3575" }}>Servicios</h3>
            <ul>
              {empleado.servicios.map((s, i) => <li key={i} style={{ color: "#555", marginBottom: 6 }}>{s}</li>)}
            </ul>
          </div>

          <div style={{ marginTop: 12 }}>
            <h3 style={{ margin: "6px 0 12px 0", color: "#4c3575" }}>Comentarios</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {empleado.comentarios.map((c, i) => (
                <div key={i} style={{ background: "#faf7fb", padding: 10, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700 }}>{c.usuario}</div>
                  <div style={{ color: "#555" }}>{c.texto}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}