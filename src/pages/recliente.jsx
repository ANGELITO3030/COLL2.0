import React, { useState } from "react";
import axios from "axios";
import EmailVerificationModal from "./EmailVerificationModal"; // Mismo componente que usamos antes

const RegistroCliente = ({ goBack }) => {
  const [aceptarTerminos, setAceptarTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  const [form, setForm] = useState({
    tipo_cliente: "",
    tipo_documento: "",
    documento_cliente: "",
    nombre_cliente: "",
    apellido_cliente: "",
    direccion_cliente: "",
    telefono_cliente: "",
    correo_cliente: "",
    contrasena: "",
    confirmarContrasena: "",
    historial_servicios: "",
    razon_social: "",
    nit_empresa: "",
    representante_legal: "",
    correo_empresa: "",
    telefono_empresa: "",
    fecha_registro: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🔍 Validaciones
  const validarFormulario = () => {
    let newErrors = {};

    if (!form.tipo_cliente) newErrors.tipo_cliente = "Seleccione el tipo de cliente.";

    if (form.tipo_cliente === "Persona") {
      if (!form.tipo_documento) newErrors.tipo_documento = "Seleccione el tipo de documento.";
      if (!form.documento_cliente.match(/^[0-9]{6,12}$/))
        newErrors.documento_cliente = "Ingrese un número de documento válido.";
      if (!form.nombre_cliente.match(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/))
        newErrors.nombre_cliente = "El nombre solo puede contener letras.";
      if (form.apellido_cliente && !form.apellido_cliente.match(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/))
        newErrors.apellido_cliente = "El apellido solo puede contener letras.";
      if (form.telefono_cliente && !form.telefono_cliente.match(/^[0-9]{7,15}$/))
        newErrors.telefono_cliente = "El teléfono debe tener entre 7 y 15 dígitos.";
      if (!form.correo_cliente.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        newErrors.correo_cliente = "Correo electrónico no válido.";
    }

    if (form.tipo_cliente === "Empresa") {
      if (!form.razon_social.trim()) newErrors.razon_social = "Ingrese la razón social.";
      if (!form.nit_empresa.match(/^[0-9\-]{5,15}$/))
        newErrors.nit_empresa = "Ingrese un NIT válido.";
      if (!form.representante_legal.match(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/))
        newErrors.representante_legal = "El nombre solo puede contener letras.";
      if (!form.correo_empresa.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        newErrors.correo_empresa = "Correo electrónico de empresa no válido.";
      if (form.telefono_empresa && !form.telefono_empresa.match(/^[0-9]{7,15}$/))
        newErrors.telefono_empresa = "El teléfono debe tener entre 7 y 15 dígitos.";
    }

    if (!form.contrasena || form.contrasena.length < 6)
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres.";

    if (form.contrasena !== form.confirmarContrasena)
      newErrors.confirmarContrasena = "Las contraseñas no coinciden.";

    if (!aceptarTerminos)
      newErrors.terminos = "Debes aceptar los términos y condiciones.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      const { confirmarContrasena, ...formData } = form;
      const res = await axios.post("http://localhost:5000/api/clientes/registro", formData, {
        headers: { "Content-Type": "application/json" },
      });

      // Verificar si el backend requiere verificación
      if (res.data.requiresVerification) {
        // Preparar datos para la verificación
        const emailToVerify = form.tipo_cliente === "Persona" 
          ? form.correo_cliente 
          : form.correo_empresa;
        
        const userName = form.tipo_cliente === "Persona"
          ? form.nombre_cliente
          : form.razon_social;
        
        setVerificationData({
          email: emailToVerify,
          userType: form.tipo_cliente === "Persona" ? "cliente" : "empresa",
          debugCode: res.data.debugCode, // Solo en desarrollo
          tipo: form.tipo_cliente,
          userName: userName
        });
        
        // Mostrar modal de verificación
        setShowVerification(true);
        
        // Limpiar formulario (pero mantener tipo_cliente para mensajes personalizados)
        const tipoClienteTemp = form.tipo_cliente;
        setForm({
          tipo_cliente: "",
          tipo_documento: "",
          documento_cliente: "",
          nombre_cliente: "",
          apellido_cliente: "",
          direccion_cliente: "",
          telefono_cliente: "",
          correo_cliente: "",
          contrasena: "",
          confirmarContrasena: "",
          historial_servicios: "",
          razon_social: "",
          nit_empresa: "",
          representante_legal: "",
          correo_empresa: "",
          telefono_empresa: "",
          fecha_registro: new Date().toISOString().split("T")[0],
        });
        setAceptarTerminos(false);
        setErrors({});
        
        // Mostrar mensaje de éxito para el registro
        console.log(`${tipoClienteTemp} registrado. Requiere verificación de email.`);
      } else {
        // Si no requiere verificación (caso raro)
        alert(res.data.mensaje || "Registro exitoso ✅");
        
        setForm({
          tipo_cliente: "",
          tipo_documento: "",
          documento_cliente: "",
          nombre_cliente: "",
          apellido_cliente: "",
          direccion_cliente: "",
          telefono_cliente: "",
          correo_cliente: "",
          contrasena: "",
          confirmarContrasena: "",
          historial_servicios: "",
          razon_social: "",
          nit_empresa: "",
          representante_legal: "",
          correo_empresa: "",
          telefono_empresa: "",
          fecha_registro: new Date().toISOString().split("T")[0],
        });
        setAceptarTerminos(false);
        setErrors({});
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || "Error al registrar cliente ❌";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    // Cuando la verificación es exitosa
    const userTypeName = verificationData.tipo === "Persona" ? "Cliente Persona" : "Empresa";
    alert(`¡${userTypeName} verificado exitosamente! Ya puedes iniciar sesión.`);
    
    setShowVerification(false);
    setVerificationData(null);
    
    // Volver atrás si hay función goBack
    if (typeof goBack === "function") {
      goBack();
    }
  };

  const handleCloseVerification = () => {
    const userTypeName = verificationData.tipo === "Persona" ? "cliente persona" : "empresa";
    const confirmClose = window.confirm(
      `¿Cerrar la verificación? Necesitarás verificar tu email para iniciar sesión como ${userTypeName}. ` +
      "Puedes usar el código que te enviamos por correo o solicitar uno nuevo más tarde."
    );
    
    if (confirmClose) {
      setShowVerification(false);
      setVerificationData(null);
    }
  };

  // Determinar el email a mostrar en el título del modal
  const getModalTitle = () => {
    if (!verificationData) return "Verificar Email";
    
    if (verificationData.tipo === "Persona") {
      return `Verificar Email - Cliente Persona`;
    } else {
      return `Verificar Email - Empresa`;
    }
  };

  return (
    <>
      <div style={styles.body}>
        <div style={{ ...styles.container, position: "relative" }}>
          {goBack && (
            <button onClick={goBack} style={styles.backButton} title="Atrás">
              ←
            </button>
          )}

          <h2 style={styles.title}>Registro de Cliente</h2>
          
          {/* Nota sobre verificación */}
          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              <strong>Importante:</strong> Después del registro, necesitarás 
              verificar tu correo electrónico con un código de 6 dígitos que te enviaremos.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Tipo Cliente */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tipo de Cliente *</label>
              <select 
                name="tipo_cliente" 
                value={form.tipo_cliente} 
                onChange={handleChange} 
                style={styles.input}
              >
                <option value="">Seleccione...</option>
                <option value="Persona">Persona Natural</option>
                <option value="Empresa">Empresa</option>
              </select>
              {errors.tipo_cliente && <span style={styles.error}>{errors.tipo_cliente}</span>}
            </div>

            {/* Persona */}
            {form.tipo_cliente === "Persona" && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tipo de Documento *</label>
                  <select 
                    name="tipo_documento" 
                    value={form.tipo_documento} 
                    onChange={handleChange} 
                    style={styles.input}
                  >
                    <option value="">Seleccione...</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PA">Pasaporte</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                  {errors.tipo_documento && <span style={styles.error}>{errors.tipo_documento}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Número de Documento *</label>
                  <input 
                    type="text" 
                    name="documento_cliente" 
                    value={form.documento_cliente} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: 1053674892"
                  />
                  {errors.documento_cliente && <span style={styles.error}>{errors.documento_cliente}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nombre *</label>
                  <input 
                    type="text" 
                    name="nombre_cliente" 
                    value={form.nombre_cliente} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: Juan"
                  />
                  {errors.nombre_cliente && <span style={styles.error}>{errors.nombre_cliente}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Apellido</label>
                  <input 
                    type="text" 
                    name="apellido_cliente" 
                    value={form.apellido_cliente} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: Pérez"
                  />
                  {errors.apellido_cliente && <span style={styles.error}>{errors.apellido_cliente}</span>}
                </div>
              </>
            )}

            {/* Empresa */}
            {form.tipo_cliente === "Empresa" && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Razón Social *</label>
                  <input 
                    type="text" 
                    name="razon_social" 
                    value={form.razon_social} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: Mi Empresa SAS"
                  />
                  {errors.razon_social && <span style={styles.error}>{errors.razon_social}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>NIT *</label>
                  <input 
                    type="text" 
                    name="nit_empresa" 
                    value={form.nit_empresa} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: 900123456-7"
                  />
                  {errors.nit_empresa && <span style={styles.error}>{errors.nit_empresa}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Representante Legal *</label>
                  <input 
                    type="text" 
                    name="representante_legal" 
                    value={form.representante_legal} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: María Rodríguez"
                  />
                  {errors.representante_legal && <span style={styles.error}>{errors.representante_legal}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Correo Empresa *</label>
                  <input 
                    type="email" 
                    name="correo_empresa" 
                    value={form.correo_empresa} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: contacto@miempresa.com"
                  />
                  {errors.correo_empresa && <span style={styles.error}>{errors.correo_empresa}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Teléfono Empresa</label>
                  <input 
                    type="tel" 
                    name="telefono_empresa" 
                    value={form.telefono_empresa} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: 6012345678"
                  />
                  {errors.telefono_empresa && <span style={styles.error}>{errors.telefono_empresa}</span>}
                </div>
              </>
            )}

            {/* Dirección */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Dirección</label>
              <input 
                type="text" 
                name="direccion_cliente" 
                value={form.direccion_cliente} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Ej: Calle 123 #45-67"
              />
            </div>

            {/* Teléfono / Correo Persona */}
            {form.tipo_cliente === "Persona" && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefono_cliente" 
                    value={form.telefono_cliente} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: 3101234567"
                  />
                  {errors.telefono_cliente && <span style={styles.error}>{errors.telefono_cliente}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Correo Electrónico *</label>
                  <input 
                    type="email" 
                    name="correo_cliente" 
                    value={form.correo_cliente} 
                    onChange={handleChange} 
                    style={styles.input} 
                    placeholder="Ej: juan@email.com"
                  />
                  {errors.correo_cliente && <span style={styles.error}>{errors.correo_cliente}</span>}
                </div>
              </>
            )}

            {/* Historial de servicios (opcional) */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Historial de Servicios (opcional)</label>
              <textarea 
                name="historial_servicios" 
                value={form.historial_servicios} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Servicios anteriores contratados..."
                rows="3"
              />
            </div>

            {/* Contraseñas */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña *</label>
              <input 
                type="password" 
                name="contrasena" 
                value={form.contrasena} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Mínimo 6 caracteres"
              />
              {errors.contrasena && <span style={styles.error}>{errors.contrasena}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmar Contraseña *</label>
              <input 
                type="password" 
                name="confirmarContrasena" 
                value={form.confirmarContrasena} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Repite la contraseña"
              />
              {errors.confirmarContrasena && <span style={styles.error}>{errors.confirmarContrasena}</span>}
            </div>

            {/* 🔹 Fecha de Registro */}
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

            {/* Términos */}
            <div style={styles.termsContainer}>
              <input 
                type="checkbox" 
                checked={aceptarTerminos} 
                onChange={(e) => setAceptarTerminos(e.target.checked)} 
                style={{ marginRight: 8 }} 
              />
              <label style={styles.label}>
                Acepto los Términos y Condiciones *
              </label>
            </div>
            {errors.terminos && <span style={styles.error}>{errors.terminos}</span>}

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Registrando..." : "Registrar y Verificar Email"}
            </button>
            
            <div style={styles.verificationNote}>
              <small>
                * Campos obligatorios. Recibirás un código de verificación en tu correo.
              </small>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Verificación de Email */}
      {showVerification && verificationData && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <EmailVerificationModal
              email={verificationData.email}
              userType={verificationData.userType}
              debugCode={verificationData.debugCode}
              onVerificationSuccess={handleVerificationComplete}
              onClose={handleCloseVerification}
              modalTitle={getModalTitle()}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Agregamos nuevos estilos
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
  infoBox: {
    background: "#e6f7ff",
    border: "1px solid #91d5ff",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "20px",
  },
  infoText: {
    margin: 0,
    color: "#0050b3",
    fontSize: "0.9em",
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
    marginTop: "10px",
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
  termsContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    marginTop: "10px",
  },
  verificationNote: {
    marginTop: "15px",
    textAlign: "center",
    color: "#666",
    fontSize: "0.85em",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  },
};



export default RegistroCliente;