export default function DatosPersonales({ goBack }) {
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
        Cuidado y Protección de Datos Personales
      </h2>

      <p>
        En <b>COLLSERVICE</b>, garantizamos el cumplimiento de la normativa sobre
        protección de datos personales y nos comprometemos a proteger la
        privacidad, integridad y seguridad de la información que nos confías.
      </p>

      <p>
        <b>1. Finalidad del tratamiento:</b> los datos personales que
        recopilamos se utilizan exclusivamente para la gestión administrativa,
        operativa y comercial relacionada con la prestación de nuestros
        servicios de limpieza, atención al cliente, y comunicación con nuestros
        usuarios y empleados.
      </p>

      <p>
        <b>2. Derechos del titular:</b> como usuario tienes derecho a acceder,
        conocer, actualizar, rectificar y eliminar tus datos personales, así
        como a revocar la autorización otorgada para su tratamiento. Puedes
        ejercer estos derechos enviando una solicitud al correo electrónico{" "}
        <b>soporte@collservice.com</b>.
      </p>

      <p>
        <b>3. Autorización y consentimiento:</b> al registrarte o utilizar
        nuestros servicios, autorizas expresamente a <b>COLLSERVICE</b> para
        recopilar, almacenar y tratar tus datos personales conforme a los fines
        descritos. Esta autorización podrá ser revocada en cualquier momento.
      </p>

      <p>
        <b>4. Seguridad de la información:</b> implementamos medidas técnicas,
        humanas y administrativas para proteger tus datos personales frente a
        accesos no autorizados, uso indebido, pérdida o alteración. Solo el
        personal autorizado tiene acceso a esta información.
      </p>

      <p>
        <b>5. Conservación de los datos:</b> los datos personales serán
        conservados durante el tiempo necesario para cumplir con los fines para
        los cuales fueron recopilados, o mientras exista una relación contractual
        o legal que lo justifique.
      </p>

      <p>
        <b>6. Modificaciones de esta política:</b> <b>COLLSERVICE</b> se reserva
        el derecho de modificar esta política en cualquier momento. Las
        actualizaciones serán publicadas en esta misma sección y entrarán en
        vigor desde la fecha de su publicación.
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
