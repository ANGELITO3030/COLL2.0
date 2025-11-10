import React, { useState } from "react";
import axios from "axios";

const RegistroEmpleada = ({ goBack }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    fecha_nacimiento: "",
    correo: "",
    telefono: "",
    direccion: "",
    experiencia: "",
    disponibilidad: "",
    antecedentes_penales: null,
    antecedentes_judiciales: null,
    contrasena: "",
    confirmarContrasena: "",
    aceptar_terminos: false,
    fecha_registro: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validarFormulario = () => {
    let newErrors = {};

    if (!form.nombre.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/))
      newErrors.nombre = "El nombre solo puede contener letras.";

    if (!form.apellido.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/))
      newErrors.apellido = "El apellido solo puede contener letras.";

    if (!form.cedula.match(/^[0-9]{6,12}$/))
      newErrors.cedula = "Ingrese un número de cédula válido.";

    if (!form.fecha_nacimiento)
      newErrors.fecha_nacimiento = "Ingrese la fecha de nacimiento.";

    if (!form.correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.correo = "Correo electrónico no válido.";

    if (!form.telefono.match(/^[0-9]{7,15}$/))
      newErrors.telefono = "El teléfono debe tener entre 7 y 15 dígitos.";

    if (!form.direccion.trim())
      newErrors.direccion = "Ingrese una dirección válida.";

    if (!form.antecedentes_penales)
      newErrors.antecedentes_penales = "Debe adjuntar antecedentes penales.";

    if (!form.antecedentes_judiciales)
      newErrors.antecedentes_judiciales =
        "Debe adjuntar antecedentes judiciales.";

    if (!form.contrasena || form.contrasena.length < 6)
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres.";

    if (form.contrasena !== form.confirmarContrasena)
      newErrors.confirmarContrasena = "Las contraseñas no coinciden.";

    if (!form.aceptar_terminos)
      newErrors.aceptar_terminos = "Debe aceptar los Términos y Condiciones.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      const res = await axios.post(
        "http://localhost:5000/api/empleadas/registro",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(res.data.mensaje || "Registro exitoso ✅");

      setForm({
        nombre: "",
        apellido: "",
        cedula: "",
        fecha_nacimiento: "",
        correo: "",
        telefono: "",
        direccion: "",
        experiencia: "",
        disponibilidad: "",
        antecedentes_penales: null,
        antecedentes_judiciales: null,
        contrasena: "",
        confirmarContrasena: "",
        aceptar_terminos: false,
        fecha_registro: new Date().toISOString().split("T")[0],
      });
      setErrors({});
      if (typeof goBack === "function") goBack();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Error al registrar empleada ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={{ ...styles.container, position: "relative" }}>
        {goBack && (
          <button onClick={goBack} style={styles.backButton} title="Atrás">
            ←
          </button>
        )}

        <h2 style={styles.title}>Registro de Empleada</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* 🔹 Datos personales */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Ejemplo: Laura"
              value={form.nombre}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.nombre && <span style={styles.error}>{errors.nombre}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Apellido</label>
            <input
              type="text"
              name="apellido"
              placeholder="Ejemplo: González"
              value={form.apellido}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.apellido && (
              <span style={styles.error}>{errors.apellido}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Número de Cédula</label>
            <input
              type="text"
              name="cedula"
              placeholder="Ejemplo: 1053674892"
              value={form.cedula}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.cedula && <span style={styles.error}>{errors.cedula}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Fecha de Nacimiento</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.fecha_nacimiento && (
              <span style={styles.error}>{errors.fecha_nacimiento}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              placeholder="Ejemplo: laura.gonzalez@email.com"
              value={form.correo}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.correo && <span style={styles.error}>{errors.correo}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              placeholder="Ejemplo: 3105678901"
              value={form.telefono}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.telefono && (
              <span style={styles.error}>{errors.telefono}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Dirección</label>
            <input
              type="text"
              name="direccion"
              placeholder="Ejemplo: Calle 45 #12-08, Medellín"
              value={form.direccion}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.direccion && (
              <span style={styles.error}>{errors.direccion}</span>
            )}
          </div>

          {/* 🔹 Experiencia */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Experiencia / Observaciones</label>
            <textarea
              name="experiencia"
              placeholder="Ejemplo: 2 años en limpieza doméstica y hotelera"
              value={form.experiencia}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Disponibilidad</label>
            <input
              type="text"
              name="disponibilidad"
              placeholder="Ejemplo: Lunes a Viernes de 8 a.m. a 5 p.m."
              value={form.disponibilidad}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* 🔹 Documentos */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Certificado de Antecedentes Penales</label>
            <input
              type="file"
              name="antecedentes_penales"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={handleChange}
              style={styles.input}
            />
            {errors.antecedentes_penales && (
              <span style={styles.error}>{errors.antecedentes_penales}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Certificado de Antecedentes Judiciales</label>
            <input
              type="file"
              name="antecedentes_judiciales"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={handleChange}
              style={styles.input}
            />
            {errors.antecedentes_judiciales && (
              <span style={styles.error}>{errors.antecedentes_judiciales}</span>
            )}
          </div>

          {/* 🔹 Contraseñas */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              placeholder="Mínimo 6 caracteres"
              value={form.contrasena}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.contrasena && (
              <span style={styles.error}>{errors.contrasena}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmarContrasena"
              placeholder="Repite la contraseña"
              value={form.confirmarContrasena}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.confirmarContrasena && (
              <span style={styles.error}>{errors.confirmarContrasena}</span>
            )}
          </div>

          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Fecha de Registro</label>
            <input
              type="text"
              name="fecha_registro"
              value={form.fecha_registro}
              readOnly
              style={{ ...styles.input, background: "#eee" }}
            />
          </div>

          {/* 🔹 Términos y condiciones (solo texto) */}
          <div
            style={{
              ...styles.inputGroup,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              name="aceptar_terminos"
              checked={form.aceptar_terminos}
              onChange={handleChange}
              style={{ marginRight: 8 }}
            />
            <label style={styles.label}>
              Acepto los Términos y Condiciones
            </label>
          </div>
          {errors.aceptar_terminos && (
            <span style={styles.error}>{errors.aceptar_terminos}</span>
          )}


          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "100vh",
    padding: "30px",
  },
  container: {
    background: "#f4e6ff",
    borderRadius: 12,
    boxShadow: "0 0 20px rgba(59,5,127,0.12)",
    width: 420,
    padding: 24,
  },
  title: { textAlign: "center", marginBottom: 16, color: "#4b2879" },
  inputGroup: { marginBottom: 12, display: "flex", flexDirection: "column" },
  label: { fontWeight: 600, marginBottom: 6, color: "#4b2879" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #7b68ee" },
  error: { color: "red", fontSize: "0.8em", marginTop: 4 },
  button: {
    padding: "10px 14px",
    background: "#6d4ad9",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 16,
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#a18cd1",
  },
};

export default RegistroEmpleada;
