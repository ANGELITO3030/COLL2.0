import React, { useState } from "react";
import ChatPage from "./chat";
import StarRating from "../components/StarRating";
const empleadosData = [
  {
    id: 1,
    nombre: "Ana Torres",
    foto: "/can.png",
    puesto: "Niñera",
    descripcion: "Responsable y cariñosa, 5 años de experiencia.",
    especialidad: "Cuidado de niños",
    detalles: "Certificada en primeros auxilios. Referencias comprobables. Disponible tiempo completo.",
  },
  {
    id: 2,
    nombre: "Luis Gómez",
    foto: "/lav.png",
    puesto: "Lavandero",
    descripcion: "Rápido y eficiente, experto en lavado de ropa.",
    especialidad: "Lavandería",
    detalles: "Experiencia en hoteles. Manejo de productos ecológicos. Puntualidad garantizada.",
  },
  {
    id: 3,
    nombre: "María Pérez",
    foto: "/nin.png",
    puesto: "Cuidadora de mascotas",
    descripcion: "Amante de los animales, paseos y cuidado diario.",
    especialidad: "Cuidado de mascotas",
    detalles: "Cuida perros y gatos. Paseos diarios y administración de medicamentos.",
  },
  {
    id: 4,
    nombre: "Sofía Ramírez",
    foto: "/lav.png",
    puesto: "Aseadora general",
    descripcion: "Orden y limpieza en cada rincón de tu hogar.",
    especialidad: "Aseo general",
    detalles: "Limpieza profunda, organización de espacios, experiencia en casas grandes.",
  },
  {
    id: 5,
    nombre: "Paola Jiménez",
    foto: "/can.png",
    puesto: "Cocinera doméstica",
    descripcion: "Cocina saludable y variada para toda la familia.",
    especialidad: "Cocina doméstica",
    detalles: "Especialidad en menús infantiles y dietas especiales. Referencias disponibles.",
  },
  {
    id: 6,
    nombre: "Diana López",
    foto: "/nin.png",
    puesto: "Planchadora",
    descripcion: "Ropa impecable y bien cuidada.",
    especialidad: "Planchado",
    detalles: "Planchado profesional, cuidado de prendas delicadas, servicio a domicilio.",
  },
];

function Cliente() {
  const [busqueda, setBusqueda] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [verMasId, setVerMasId] = useState(null);
  const [chatEmpleado, setChatEmpleado] = useState(null);

  // Obtener especialidades únicas
  const especialidades = [
    ...new Set(empleadosData.map((e) => e.especialidad)),
  ];

  // Filtrar empleados
  const empleadosFiltrados = empleadosData.filter((empleado) => {
    const coincideBusqueda =
      empleado.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.puesto.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEspecialidad =
      !especialidad || empleado.especialidad === especialidad;
    return coincideBusqueda && coincideEspecialidad;
  });

  const empleadoDetalle = empleadosData.find(e => e.id === verMasId);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Empleados disponibles</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Buscar por nombre o puesto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-64"
        />
        <select
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-48"
        >
          <option value="">Todas las especialidades</option>
          {especialidades.map((esp) => (
            <option key={esp} value={esp}>{esp}</option>
          ))}
        </select>
      </div>
      {verMasId && empleadoDetalle ? (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button onClick={() => setVerMasId(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
            <img src={empleadoDetalle.foto} alt={empleadoDetalle.nombre} className="w-28 h-28 object-cover rounded-full mx-auto mb-4 border" />
            <h2 className="text-2xl font-bold text-center mb-2">{empleadoDetalle.nombre}</h2>
            <p className="text-center text-gray-600 mb-1">{empleadoDetalle.puesto}</p>
            <p className="text-center text-gray-500 mb-2">{empleadoDetalle.especialidad}</p>
            <p className="text-center text-gray-700 mb-2">{empleadoDetalle.descripcion}</p>
            <div className="bg-gray-100 rounded p-3 text-gray-700 text-sm">
              {empleadoDetalle.detalles}
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex flex-row gap-6">
        {chatEmpleado && (
          <div className="w-1/3 bg-white rounded-lg shadow-lg p-4 h-[600px] overflow-auto">
            <ChatPage
              initialState={{
                employee: { id: chatEmpleado.id, nombre: chatEmpleado.nombre },
                role: "cliente"
              }}
              onClose={() => setChatEmpleado(null)}
            />
          </div>
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${chatEmpleado ? 'w-2/3 md:grid-cols-2' : 'w-full md:grid-cols-3'}`}>
          {empleadosFiltrados.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No se encontraron empleados.</div>
          ) : (
            empleadosFiltrados.map((empleado) => (
              <div
                key={empleado.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-pink-100 hover:shadow-2xl transition group relative overflow-hidden"
                style={{ boxShadow: '0 6px 24px 0 rgba(231,107,178,0.08)', minHeight: 370 }}
              >
                <div className="absolute -top-8 right-0 opacity-10 text-pink-400 text-8xl pointer-events-none select-none group-hover:opacity-20 transition">★</div>
                <img
                  src={empleado.foto}
                  alt={empleado.nombre}
                  className="w-24 h-24 object-cover rounded-full mb-3 border-4 border-pink-200 shadow group-hover:scale-105 transition"
                  style={{ background: '#fbc2eb' }}
                />
                <h2 className="text-xl font-bold text-pink-700 mb-1 group-hover:text-pink-500 transition">{empleado.nombre}</h2>
                <p className="text-pink-400 font-semibold mb-1">{empleado.puesto}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">{empleado.especialidad}</span>
                  <div>
                    <StarRating employeeId={empleado.id} />
                  </div>
                </div>
                <p className="text-left text-gray-700 mb-2 text-sm">{empleado.descripcion}</p>
                <div className="flex gap-2">
                  <button
                    className="mt-auto px-5 py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full font-bold shadow hover:from-pink-500 hover:to-pink-700 transition"
                    onClick={() => setVerMasId(empleado.id)}
                  >
                    Ver perfil
                  </button>
                  <button
                    className="mt-auto px-5 py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full font-bold shadow hover:from-pink-500 hover:to-pink-700 transition"
                    onClick={() => setChatEmpleado(empleado)}
                  >
                    Contactar empleada
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Cliente;
