import React, { useState } from "react";
import axios from "axios";

export default function RegistroAdministrador({ goBack }) {
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [form, setForm] = useState({
    usuario_admin: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    cargo: "",
    area: "",
    contrasena: "",
    confirmarContrasena: "",
    fecha_registro: new Date().toISOString().split("T")[0],
  });

  const validarCampo = (name, value) => {
    let error = "";

    const validaciones = {
      nombre: () => {
        if (!value.trim()) return "El nombre es obligatorio.";
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return "El nombre solo puede contener letras.";
        return "";
      },
      apellido: () => {
        if (!value.trim()) return "";
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return "El apellido solo puede contener letras.";
        return "";
      },
      correo: () => {
        if (!value.trim()) return "El correo es obligatorio.";
        if (!/\S+@\S+\.\S+/.test(value))
          return "Ingresa un correo electrónico válido.";
        return "";
      },
      telefono: () => {
        if (value && !/^\d{7,10}$/.test(value))
          return "El teléfono debe tener entre 7 y 10 dígitos.";
        return "";
      },
      direccion: () => {
        if (value && value.length < 5)
          return "La dirección debe tener al menos 5 caracteres.";
        return "";
      },
      cargo: () => {
        if (!value.trim()) return "El cargo es obligatorio.";
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return "El cargo solo puede contener letras.";
        return "";
      },
      area: () => {
        if (!value.trim()) return "El área es obligatorio.";
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return "El área solo puede contener letras.";
        return "";
      },
      usuario_admin: () => {
        if (!value.trim()) return "El usuario es obligatorio.";
        if (!/^[a-zA-Z0-9]+$/.test(value))
          return "El usuario solo puede contener letras y números.";
        if (value.length < 3)
          return "El usuario debe tener al menos 3 caracteres.";
        return "";
      },
      contrasena: () => {
        if (!value.trim()) return "La contraseña es obligatoria.";
        if (value.length < 6)
          return "La contraseña debe tener al menos 6 caracteres.";
        return "";
      },
      confirmarContrasena: () => {
        if (!value.trim()) return "Confirma la contraseña.";
        if (value !== form.contrasena)
          return "Las contraseñas no coinciden.";
        return "";
      }
    };

    if (validaciones[name]) {
      error = validaciones[name]();
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validarCampo(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validarCampo(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const campos = Object.keys(form).filter(key => key !== 'fecha_registro');
    const nuevoTouched = {};
    campos.forEach(campo => { nuevoTouched[campo] = true; });
    setTouched(nuevoTouched);

    // Validar todos los campos
    Object.keys(form).forEach((key) => validarCampo(key, form[key]));

    // Verificar errores
    const hayErrores = Object.values(errors).some(err => err);
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
      
      // Preparar datos para enviar (sin confirmarContrasena)
      const { confirmarContrasena, ...datosEnvio } = form;
      
      // Asegurar que campos opcionales vacíos se envíen como null
      const datosFinales = {
        ...datosEnvio,
        apellido: datosEnvio.apellido.trim() === "" ? null : datosEnvio.apellido,
        telefono: datosEnvio.telefono.trim() === "" ? null : datosEnvio.telefono,
        direccion: datosEnvio.direccion.trim() === "" ? null : datosEnvio.direccion
      };
      
      console.log('Enviando datos:', datosFinales);
      
      const res = await axios.post(
        "http://localhost:5000/api/administradores/registro",
        datosFinales,
        { headers: { "Content-Type": "application/json" } }
      );
      
      alert(res.data?.mensaje || "✅ Administrador registrado con éxito");
      
      // Limpiar formulario
      setForm({
        usuario_admin: "",
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        direccion: "",
        cargo: "",
        area: "",
        contrasena: "",
        confirmarContrasena: "",
        fecha_registro: new Date().toISOString().split("T")[0],
      });
      
      setErrors({});
      setTouched({});
      setAceptaTerminos(false);
      
      if (typeof goBack === "function") goBack();
      
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || "Error al registrar administrador ❌";
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
            { name: "usuario_admin", label: "Usuario (ID) *", placeholder: "Ej: admin123", required: true },
            { name: "nombre", label: "Nombre *", placeholder: "Ej: María", required: true },
            { name: "apellido", label: "Apellido", placeholder: "Ej: López (opcional)", required: false },
            { name: "correo", label: "Correo electrónico *", type: "email", placeholder: "Ej: admin@empresa.com", required: true },
            { name: "telefono", label: "Teléfono", type: "tel", placeholder: "Solo números (7-10 dígitos)", required: false },
            { name: "direccion", label: "Dirección", placeholder: "Ej: Calle 123 #45-67", required: false },
            { name: "cargo", label: "Cargo *", placeholder: "Ej: Coordinador de Operaciones", required: true },
            { name: "area", label: "Área *", placeholder: "Ej: Recursos Humanos", required: true },
            { name: "fecha_registro", label: "Fecha de registro", type: "date", required: false },
            { name: "contrasena", label: "Contraseña *", type: "password", placeholder: "Mínimo 6 caracteres", required: true },
            { name: "confirmarContrasena", label: "Confirmar Contraseña *", type: "password", placeholder: "Repite la contraseña", required: true },
          ].map((field) => (
            <div key={field.name} style={styles.inputGroup}>
              <label style={styles.label}>
                {field.label} {field.required && <span style={{color: "red"}}>*</span>}
              </label>
              
              <input
                name={field.name}
                type={field.type || "text"}
                value={form[field.name]}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{
                  ...styles.input,
                  borderColor: errors[field.name] ? "red" : "#7b68ee",
                  backgroundColor: field.name === "fecha_registro" ? "#eee" : "white",
                  cursor: field.name === "fecha_registro" ? "not-allowed" : "text"
                }}
                placeholder={field.placeholder}
                required={field.required}
                readOnly={field.name === "fecha_registro"}
              />
              
              {touched[field.name] && errors[field.name] && (
                <span style={styles.error}>{errors[field.name]}</span>
              )}
            </div>
          ))}

          <div style={{ ...styles.inputGroup, flexDirection: "row", alignItems: "center" }}>
            <input
              type="checkbox"
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

// ESTILOS ORIGINALES
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
  title: { 
    textAlign: "center", 
    marginBottom: 16, 
    color: "#4b2879"
  },
  inputGroup: { 
    marginBottom: 12, 
    display: "flex", 
    flexDirection: "column" 
  },
  label: { 
    fontWeight: 600, 
    marginBottom: 6, 
    color: "#4b2879"
  },
  input: { 
    padding: 8, 
    borderRadius: 6, 
    border: "1px solid #7b68ee",
    fontSize: "14px",
    outline: "none"
  },
  error: { 
    color: "red", 
    fontSize: "0.8em", 
    marginTop: 4 
  },
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