import React, { useState } from "react";
import axios from "axios";

export default function RegistroAdministrador({ goBack }) {
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    usuario_admin: "",
    contrasena: "",
    confirmarContrasena: "",
    cargo: "",
    area: "",
    tipo_acceso: "Normal",
    fecha_contratacion: "",
    fecha_registro: new Date().toISOString().split("T")[0], // 👈 fecha actual por defecto
  });

  const validarCampo = (name, value) => {
    let error = "";

    if (name === "nombre" && !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
      error = "El nombre solo puede contener letras.";
    if (name === "correo" && !/\S+@\S+\.\S+/.test(value))
      error = "Ingresa un correo electrónico válido.";
    if (name === "telefono" && value && !/^\d{7,10}$/.test(value))
      error = "El teléfono debe tener entre 7 y 10 dígitos numéricos.";
    if (name === "contrasena" && value.length < 6)
      error = "La contraseña debe tener al menos 6 caracteres.";
    if (name === "confirmarContrasena" && value !== form.contrasena)
      error = "Las contraseñas no coinciden.";
    if (name === "cargo" && !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
      error = "El cargo solo puede contener letras.";
    if (name === "area" && !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
      error = "El área solo puede contener letras.";

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (touched[name]) validarCampo(name, val);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validarCampo(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      nombre: true,
      correo: true,
      telefono: true,
      usuario_admin: true,
      contrasena: true,
      confirmarContrasena: true,
      cargo: true,
      area: true,
      fecha_contratacion: true,
    });

    Object.keys(form).forEach((key) => validarCampo(key, form[key]));

    if (
      !form.nombre ||
      !form.correo ||
      !form.usuario_admin ||
      !form.contrasena ||
      !form.confirmarContrasena ||
      !form.cargo ||
      !form.area
    ) {
      alert(
        "Por favor complete todos los campos obligatorios: nombre, correo, usuario, contraseña, confirmar contraseña, cargo y área."
      );
      return;
    }

    const hayErrores = Object.values(errors).some((err) => err);
    if (hayErrores) {
      alert("Por favor corrige los errores antes de continuar.");
      return;
    }

    if (form.contrasena !== form.confirmarContrasena) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!aceptaTerminos) {
      alert("Debe aceptar los Términos y Condiciones antes de continuar.");
      return;
    }

    try {
      setLoading(true);
      const { confirmarContrasena, ...datosEnvio } = form;
      const res = await axios.post(
        "http://localhost:5000/api/administradores/registro",
        datosEnvio,
        { headers: { "Content-Type": "application/json" } }
      );
      alert(res.data?.mensaje || "Administrador registrado con éxito ✅");
      setForm({
        nombre: "",
        correo: "",
        telefono: "",
        usuario_admin: "",
        contrasena: "",
        confirmarContrasena: "",
        cargo: "",
        area: "",
        tipo_acceso: "Normal",
        fecha_contratacion: "",
        fecha_registro: new Date().toISOString().split("T")[0], // 👈 reinicia con la fecha actual
      });
      setErrors({});
      setTouched({});
      setAceptaTerminos(false);
      if (typeof goBack === "function") goBack();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.error || "Error al registrar administrador";
      alert(msg);
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

        <h2 style={styles.title}>Registro de Administrador</h2>

        <form onSubmit={handleSubmit} noValidate>
          {[
            { name: "nombre", label: "Nombre completo", placeholder: "Ej: María López" },
            { name: "correo", label: "Correo electrónico", type: "email", placeholder: "Ej: admin@empresa.com" },
            { name: "telefono", label: "Teléfono (opcional)", type: "tel", placeholder: "Solo números" },
            { name: "usuario_admin", label: "Usuario (ID)", placeholder: "Ej: admin123" },
            { name: "contrasena", label: "Contraseña", type: "password", placeholder: "Mínimo 6 caracteres" },
            { name: "confirmarContrasena", label: "Confirmar Contraseña", type: "password", placeholder: "Repite la contraseña" },
            { name: "cargo", label: "Cargo", placeholder: "Ej: Coordinador de Operaciones" },
            { name: "area", label: "Área", placeholder: "Ej: Recursos Humanos" },
            { name: "fecha_registro", label: "Fecha de registro", type: "date", readOnly: true },
          ].map((field) => (
            <div key={field.name} style={styles.inputGroup}>
              <label style={styles.label}>{field.label}</label>
              <input
                name={field.name}
                type={field.type || "text"}
                value={form[field.name]}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{
                  ...styles.input,
                  borderColor: errors[field.name] ? "red" : "#7b68ee",
                }}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
                required={field.name !== "telefono"}
              />
              {touched[field.name] && errors[field.name] && (
                <span style={styles.error}>{errors[field.name]}</span>
              )}
            </div>
          ))}

          {/* 🔹 Términos y condiciones */}
          <div
            style={{
              ...styles.inputGroup,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              name="aceptaTerminos"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            <label style={styles.label}>
              Acepto los Términos y Condiciones
            </label>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Registrando..." : "Registrar Administrador"}
          </button>
        </form>
      </div>
    </div>
  );
}

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
    marginTop: 12,
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
