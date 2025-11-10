import { FaWhatsapp } from "react-icons/fa";

export default function ContactoEmpresaInfo({ goBack }) {
  return (
    <section className="flex flex-col items-center justify-start min-h-screen pt-32 bg-gray-50 px-4">
      <h2 className="text-4xl font-bold mb-8" style={{ color: "black" }}>
        Información de Contacto Empresarial
      </h2>

      <div
        className="w-full max-w-xl rounded-lg shadow-lg p-8 space-y-6 text-gray-900 text-center bg-white"
        style={{ border: "4px solid #F7D7E9" }}
      >
        <div className="text-lg">
          <strong>Empresa:</strong> COLSERVICE
        </div>
        <div className="text-lg">
          <strong>Contacto:</strong> Evelin Arango
        </div>
        <div className="text-lg">
          <strong>Correo:</strong> soporte@collservice.com
        </div>
        <div className="text-lg">
          <strong>Teléfono:</strong> +57 301 456 7890
        </div>

        {/* ✅ Texto adicional */}
        <p className="text-md text-gray-700 mt-4">
          Contactate con nosotros para ayudarte con la solicitud del servicio con la empleada que desees
        </p>

        {/* ✅ Botón de WhatsApp */}
        <a
          href="https://wa.me/573014567890"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mt-2 transition"
        >
          <FaWhatsapp size={22} />
          Contactar por WhatsApp
        </a>

       
        
      </div>
        {/* ✅ Botón Volver */}
        <button
          onClick={goBack}
          style={{
            marginTop: "20px",
            background: "#ecafd2ff",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ⬅ Volver
        </button>
    </section>
  );
}
