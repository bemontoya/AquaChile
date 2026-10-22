import React from 'react';
import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';
import TarjetaSolicitud from './TarjetaSolicitud';

// Mapeo o lista de columnas según los estados de tu aplicación
const COLUMNAS = [
  { id: 'Pendiente', titulo: 'PENDIENTE' },
  { id: 'En proceso', titulo: 'EN PROCESO' },
  { id: 'Finalizada', titulo: 'FINALIZADA' }
];

export default function KanbanSolicitudes({ solicitudes, setSolicitudes }) {
  
  // Función que se ejecuta al soltar la tarjeta
  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Si no se soltó sobre una columna válida, no hacemos nada
    if (!over) return;

    const tarjetaId = active.id;
    // El ID de la columna destino (ej: 'En proceso', 'Finalizada', etc.)
    const nuevoEstado = over.id;

    // Actualizamos el estado global en App.jsx
    setSolicitudes((prevSolicitudes) =>
      prevSolicitudes.map((sol) => {
        if (sol.id === tarjetaId) {
          return { ...sol, estado: nuevoEstado };
        }
        return sol;
      })
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="row g-3">
        {COLUMNAS.map((col) => {
          const tarjetasDeColumna = solicitudes.filter(
            (s) => s.estado === col.id
          );

          return (
            <ColumnaKanban
              key={col.id}
              id={col.id}
              titulo={col.titulo}
              cantidad={tarjetasDeColumna.length}
            >
              {tarjetasDeColumna.map((sol) => (
                <TarjetaArrastrable key={sol.id} solicitud={sol} />
              ))}
            </ColumnaKanban>
          );
        })}
      </div>
    </DndContext>
  );
}

// Componente para la Columna (Zona Droppable)
function ColumnaKanban({ id, titulo, cantidad, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="col-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-bold text-uppercase small text-muted">{titulo}</span>
        <span className="badge bg-white text-secondary border px-2 py-1">{cantidad}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`p-2 rounded min-vh-50 ${isOver ? 'bg-light border border-primary' : ''}`}
        style={{ minHeight: '500px' }}
      >
        {children}
      </div>
    </div>
  );
}

// Componente para la Tarjeta (Elemento Draggable)
function TarjetaArrastrable({ solicitud }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: solicitud.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="mb-3">
      <TarjetaSolicitud solicitud={solicitud} />
    </div>
  );
}