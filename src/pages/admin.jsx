import React, { useState } from "react";

const empleadosEjemplo = [
  { nombre: "María López", foto: "/lav.png", especialidad: "Limpieza general", telefono: "3001234567", correo: "maria@collservice.com" },
  { nombre: "Ana Torres", foto: "/can.png", especialidad: "Cuidado de niños", telefono: "3009876543", correo: "ana@collservice.com" },
  { nombre: "Luisa Gómez", foto: "/nin.png", especialidad: "Cocina y planchado", telefono: "3012345678", correo: "luisa@collservice.com" }
];


function Admin() {
  const [busqueda, setBusqueda] = useState("");
  const [empleados, setEmpleados] = useState([...empleadosEjemplo]);
  const [modo, setModo] = useState("lista"); // lista | agregar | editar | detalle
  const [empleadoActual, setEmpleadoActual] = useState(null);
  const [form, setForm] = useState({ nombre: "", foto: "", especialidad: "", telefono: "", correo: "" });

  // Filtros
  const empleadosFiltrados = empleados.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.especialidad.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Handlers
  const handleEliminar = idx => {
    if (window.confirm("¿Seguro que deseas eliminar a esta empleada?")) {
      setEmpleados(arr => arr.filter((_, i) => i !== idx));
    }
  };

  const handleEditar = idx => {
    setEmpleadoActual({ ...empleadosFiltrados[idx], idx });
    setForm({ ...empleadosFiltrados[idx] });
    setModo("editar");
  };

  const handleDetalle = idx => {
    setEmpleadoActual({ ...empleadosFiltrados[idx], idx });
    setModo("detalle");
  };

  const handleAgregar = () => {
    setForm({ nombre: "", foto: "", especialidad: "", telefono: "", correo: "" });
    setModo("agregar");
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    if (!form.nombre || !form.foto || !form.especialidad) {
      alert("Completa los campos obligatorios");
      return;
    }
    if (modo === "agregar") {
      setEmpleados(arr => [...arr, { ...form }]);
    } else if (modo === "editar" && empleadoActual) {
      setEmpleados(arr => arr.map((emp, i) => i === empleadoActual.idx ? { ...form } : emp));
    }
    setModo("lista");
    setEmpleadoActual(null);
  };

  const handleVolver = () => {
    setModo("lista");
    setEmpleadoActual(null);
  };

  // Render
  if (modo === "agregar" || modo === "editar") {
    return (
      <div style={{ maxWidth: 420, margin: "40px auto", background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #e6e6f5", padding: 28 }}>
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          <span style={{ color: '#fff', background: '#e76bb2', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 16, letterSpacing: 1 }}>Bienvenido Administrador</span>
        </div>
        <h2 style={{ color: "#4c3575", marginBottom: 18 }}>{modo === "agregar" ? "Agregar Empleada" : "Editar Empleada"}</h2>
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Nombre*:<br /><input name="nombre" value={form.nombre} onChange={handleFormChange} style={{ width: "100%", padding: 7, borderRadius: 7, border: "1px solid #ccc" }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Foto (URL o /archivo.png)*:<br /><input name="foto" value={form.foto} onChange={handleFormChange} style={{ width: "100%", padding: 7, borderRadius: 7, border: "1px solid #ccc" }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Especialidad*:<br /><input name="especialidad" value={form.especialidad} onChange={handleFormChange} style={{ width: "100%", padding: 7, borderRadius: 7, border: "1px solid #ccc" }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Teléfono:<br /><input name="telefono" value={form.telefono} onChange={handleFormChange} style={{ width: "100%", padding: 7, borderRadius: 7, border: "1px solid #ccc" }} /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Email:<br /><input name="correo" value={form.correo} onChange={handleFormChange} style={{ width: "100%", padding: 7, borderRadius: 7, border: "1px solid #ccc" }} /></label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button type="submit" style={{ background: "#4c3575", color: "white", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontWeight: 600 }}>Guardar</button>
            <button type="button" onClick={handleVolver} style={{ background: "#e76bb2", color: "white", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
          </div>
        </form>
      </div>
    );
  }

  if (modo === "detalle" && empleadoActual) {
    const e = empleadoActual;
    return (
      <div style={{ maxWidth: 420, margin: "40px auto", background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #e6e6f5", padding: 28 }}>
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          <span style={{ color: '#fff', background: '#e76bb2', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 16, letterSpacing: 1 }}>Bienvenido Administrador</span>
        </div>
        <h2 style={{ color: "#4c3575", marginBottom: 18 }}>Detalle de Empleada</h2>
        <img src={e.foto} alt={e.nombre} style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: "3px solid #e76bb2" }} />
        <h3 style={{ color: "#e76bb2", margin: "10px 0 6px" }}>{e.nombre}</h3>
        <div style={{ color: "#4c3575", fontWeight: 500, marginBottom: 6 }}>{e.especialidad}</div>
        <div style={{ fontSize: 13, color: "#555" }}>Tel: {e.telefono}</div>
        <div style={{ fontSize: 13, color: "#555" }}>Email: {e.correo}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={handleVolver} style={{ background: "#4c3575", color: "white", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontWeight: 600 }}>Volver</button>
        </div>
      </div>
    );
  }

  // Vista lista
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <div style={{ marginBottom: 18, textAlign: 'center' }}>
        <span style={{ color: '#fff', background: '#e76bb2', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 16, letterSpacing: 1 }}>Bienvenido Administrador</span>
      </div>
      <h2 style={{ color: "#4c3575", marginBottom: 18 }}>Panel de Administración</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Buscar empleada..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: 260 }}
        />
        <button onClick={handleAgregar} style={{ background: "#4c3575", color: "white", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontWeight: 600 }}>Agregar Empleada</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {empleadosFiltrados.length === 0 && <div style={{ color: '#888', fontStyle: 'italic', marginTop: 30 }}>No se encontraron empleadas.</div>}
        {empleadosFiltrados.map((e, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #e6e6f5", padding: 18, width: 250, textAlign: "center", position: 'relative' }}>
            <img src={e.foto} alt={e.nombre} style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: "3px solid #e76bb2" }} />
            <h3 style={{ color: "#e76bb2", margin: "10px 0 6px" }}>{e.nombre}</h3>
            <div style={{ color: "#4c3575", fontWeight: 500, marginBottom: 6 }}>{e.especialidad}</div>
            <div style={{ fontSize: 13, color: "#555" }}>Tel: {e.telefono}</div>
            <div style={{ fontSize: 13, color: "#555" }}>Email: {e.correo}</div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => handleDetalle(i)} style={{ background: "#eee", color: "#4c3575", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>Ver</button>
              <button onClick={() => handleEditar(i)} style={{ background: "#e76bb2", color: "white", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>Editar</button>
              <button onClick={() => handleEliminar(i)} style={{ background: "#4c3575", color: "white", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
