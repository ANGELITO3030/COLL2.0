import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CHATS_KEY = "chats";
const NOTIF_KEY = "notifications";
const USER_KEY = "currentUser";

export default function ChatPage(props) {
  const { initialState, onClose } = props || {};
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const state = initialState || location.state || {};
  const employee = state.employee || { id: new URLSearchParams(location.search).get("emp") || "unknown", nombre: "Empleada" };
  const role = state.role || "cliente"; // 'cliente' o 'empleada'
  const clientFromState = state.client || null;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const getCurrentClient = () => {
    if (role === "empleada") return clientFromState || null;
    try {
      const stored = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      return stored && stored.id ? stored : { id: "c_anon", nombre: "Cliente anónimo" };
    } catch {
      return { id: "c_anon", nombre: "Cliente anónimo" };
    }
  };

  const currentClient = getCurrentClient();

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(CHATS_KEY) || "[]");
      // normalize comparison to string to avoid number/string mismatches
      const forEmployee = all.filter(m => String(m.employeeId) === String(employee.id));
      setMessages(forEmployee);
    } catch (e) {
      setMessages([]);
    }
  }, [employee.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const saveMessage = (msg) => {
    try {
      const all = JSON.parse(localStorage.getItem(CHATS_KEY) || "[]");
      all.push(msg);
      localStorage.setItem(CHATS_KEY, JSON.stringify(all));
    } catch (e) {
      console.error("saveMessage error", e);
    }
  };

  const createNotificationForEmployee = (employeeId, client, text) => {
    try {
      const notifs = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
      notifs.push({
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        employeeId,
        clientId: client.id,
        clientName: client.nombre,
        text,
        time: Date.now(),
        read: false
      });
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
    } catch (e) {
      console.error("createNotification error", e);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    const sender = role === "empleada" ? "empleada" : "cliente";
    const msg = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      // store employeeId as-is (could be number or string) but comparisons use String()
      employeeId: employee.id,
      from: sender,
      text: text.trim(),
      time: Date.now(),
      clientId: sender === "cliente" ? currentClient.id : (currentClient && currentClient.id),
      clientName: sender === "cliente" ? currentClient.nombre : (currentClient && currentClient.nombre)
    };

    saveMessage(msg);
    setMessages(prev => [...prev, msg]);
    setText("");

    if (sender === "cliente") createNotificationForEmployee(employee.id, currentClient, msg.text);
  };

  return (
    <div style={{ maxWidth: 900, margin: "28px auto", padding: 18 }}>
  <button onClick={() => { if (onClose) onClose(); else navigate(-1); }} style={{ marginBottom: 12 }}>Volver</button>

      <h2 style={{ color: "#4c3575" }}>{role === "empleada" && currentClient ? `Chat: ${currentClient.nombre} → ${employee.nombre}` : `Chat con ${employee.nombre}`}</h2>

      <div ref={scrollRef} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8, height: 420, overflowY: "auto", background: "#fafafa" }}>
        {messages.length === 0 && <div style={{ color: "#888" }}>No hay mensajes todavía.</div>}
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10, display: "flex", justifyContent: m.from === "cliente" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%",
              background: m.from === "cliente" ? "#e76bb2" : "#fff",
              color: m.from === "cliente" ? "#fff" : "#333",
              padding: "8px 12px",
              borderRadius: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: 14 }}>{m.text}</div>
              <div style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>{new Date(m.time).toLocaleString()}</div>
              {m.clientName && <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6 }}>{m.clientName}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd" }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
        />
        <button onClick={handleSend} style={{ background: "#e76bb2", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6 }}>Enviar</button>
      </div>
    </div>
  );
}