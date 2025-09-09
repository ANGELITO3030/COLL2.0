export default function Perfiles() {
  const perfiles = [
    { nombre: "Ana Gómez", especialidad: "Lavandería", imagen: "/lav.png" },
    { nombre: "Carlos López", especialidad: "Cuidado canino", imagen: "/can.png" },
    { nombre: "María Rodríguez", especialidad: "Niñera", imagen: "/nin.png" },
  ];

  return (
    <section className="text-center">
      <h2 className="text-3xl font-bold mb-4">Nuestro Equipo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {perfiles.map((p, i) => (
         <div
  key={i}
  className="shadow rounded p-4 text-white"
  style={{ background: 'linear-gradient(90deg, #f2b6e2 0%, #7b1fad 100%)' }}
>

            <img
              src={p.imagen}
              alt={p.nombre}
              className="mx-auto mb-4 w-32 h-32 object-cover rounded-full"
            />
            <h3 className="text-xl font-bold">{p.nombre}</h3>
            <p className="text-gray-600">{p.especialidad}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
