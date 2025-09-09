export default function ContactoEmpresaInfo() {
  return (
    <section className="flex flex-col items-center justify-start min-h-screen pt-32 bg-gray-50 px-4">
      <h2 className="text-4xl font-bold mb-8" style={{ color: 'black' }}>
        Información de Contacto Empresarial
      </h2>

      <div
        className="w-full max-w-xl rounded-lg shadow-lg p-8 space-y-6 text-gray-900 text-center bg-white"
        style={{ border: '4px solid #F7D7E9' }} //borde//
      >
        <div className="text-lg">
          <strong>Empresa:</strong> COLSERVICE
        </div>
        <div className="text-lg">
          <strong>Contacto:</strong> Evelin Arango
        </div>
        <div className="text-lg">
          <strong>Correo:</strong> evelin.arango@collservice.com
        </div>
        <div className="text-lg">
          <strong>Teléfono:</strong> +57 301 456 7890
        </div>
      </div>
    </section>
  );
}
