export default function Privacidad({ goBack }) {
  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        background: "white",
        padding: "60px 32px 32px",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        position: "relative",
      }}
    >
      <h2 style={{ color: "#a18cd1", marginBottom: 20 }}>
        Política de Privacidad
      </h2>

      <p>
        En <b>COLLSERVICE</b>, valoramos y respetamos la privacidad de nuestros
        usuarios. La información personal que nos proporcionas es tratada con
        total confidencialidad y utilizada únicamente con fines relacionados con
        la prestación de nuestros servicios.
      </p>

      <p>
        <b>1. Recopilación de información:</b> recopilamos datos personales como
        tu nombre, correo electrónico, número de teléfono y dirección, con el
        propósito de gestionar y coordinar los servicios solicitados, mantener
        comunicación contigo para resolver dudas o brindar soporte, y mejorar la
        calidad de nuestros servicios y tu experiencia como usuario.
      </p>

      <p>
        <b>2. Uso de la información:</b> tu información personal no será
        compartida, vendida ni cedida a terceros, excepto en los siguientes
        casos: cuando exista una obligación legal que nos lo exija, o cuando sea
        necesario para cumplir con los servicios contratados (por ejemplo,
        asignar personal de limpieza o confirmar reservas).
      </p>

      <p>
        <b>3. Protección de la información:</b> implementamos medidas de
        seguridad técnicas y administrativas para proteger tus datos frente a
        accesos no autorizados, pérdida o alteración. Solo el personal
        autorizado puede acceder a esta información con fines estrictamente
        laborales.
      </p>

      <p>
        <b>4. Consentimiento:</b> al utilizar nuestros servicios o registrarte
        en nuestra plataforma, aceptas los términos de esta Política de
        Privacidad y autorizas el tratamiento de tus datos conforme a lo aquí
        establecido.
      </p>

      <p>
        <b>5. Actualizaciones de la política:</b> <b>COLLSERVICE</b> se reserva
        el derecho de modificar esta Política de Privacidad en cualquier
        momento. Cualquier cambio será publicado en esta misma página, y su
        vigencia comenzará desde la fecha de publicación.
      </p>

      {goBack && (
        <button
          onClick={goBack}
          style={{
            display: "block",
            margin: "30px auto 0",
            background: "#ecafd2ff",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ⬅ Volver
        </button>
      )}
    </div>
  );
}
