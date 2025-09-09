export default function Nosotros() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-white"
    >
      <h2 className="text-4xl font-extrabold mb-6 text-gray-900 text-center">
        Nosotros
      </h2>

      <p className="max-w-3xl text-center mb-12 text-gray-700 text-lg leading-relaxed">
        En <span className="font-semibold">COLLSERVICE</span>, nos dedicamos a ofrecer
        servicios profesionales de aseo doméstico para hogares y oficinas. Nuestro equipo está
        compuesto por personal confiable, capacitado y comprometido en brindar limpieza,
        organización y confianza en cada visita.
      </p>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full justify-center">
        {/* Tarjeta 1 */}
        <div
          className="rounded-lg shadow-lg p-8 flex-1 flex flex-col items-center justify-center text-white"
          style={{
            background: 'linear-gradient(90deg, #f2b6e2 0%, #7b1fad 100%)',
          }}
        >
          <h3 className="text-xl font-semibold mb-4">Personal Confiable</h3>
          <p className="text-center">
            Nuestro equipo está cuidadosamente seleccionado y verificado para garantizar la mejor calidad.
          </p>
        </div>

        {/* Tarjeta 2 */}
        <div
          className="rounded-lg shadow-lg p-8 flex-1 flex flex-col items-center justify-center text-white"
          style={{
            background: 'linear-gradient(90deg, #f2b6e2 0%, #7b1fad 100%)',
          }}
        >
          <h3 className="text-xl font-semibold mb-4">Atención Personalizada</h3>
          <p className="text-center">
            Nos adaptamos a las necesidades específicas de cada cliente para brindar un servicio único.
          </p>
        </div>

        {/* Tarjeta 3 */}
        <div
          className="rounded-lg shadow-lg p-8 flex-1 flex flex-col items-center justify-center text-white"
          style={{
            background: 'linear-gradient(90deg, #f2b6e2 0%, #7b1fad 100%)',
          }}
        >
          <h3 className="text-xl font-semibold mb-4">Confianza y Seguridad</h3>
          <p className="text-center">
            Garantizamos transparencia y profesionalismo en cada visita para que te sientas tranquilo.
          </p>
        </div>
      </div>
    </section>
  );
}
