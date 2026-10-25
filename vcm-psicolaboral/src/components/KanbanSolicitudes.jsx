import { useState } from 'react'
import {
  DndContext,
  closestCorners,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ESTADOS } from '../data/catalogos'

// Tarjeta individual arrastrable
function TarjetaSolicitud({ solicitud, style = {} }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: solicitud.id })

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
    ...style,
  }

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      {...attributes}
      {...listeners}
      className="card mb-2 border-0 shadow-sm"
    >
      <div className="card-body p-2">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="fw-semibold small text-truncate" title={solicitud.candidato}>
            {solicitud.candidato}
          </span>
          <span className="badge bg-light text-dark border ms-1">{solicitud.id}</span>
        </div>
        <div className="small text-muted">{solicitud.cargo}</div>
        <div className="small text-muted">{solicitud.evaluador}</div>
        <div className="d-flex justify-content-between align-items-center mt-1">
          <span className="small text-muted">{solicitud.fecha}</span>
          <span className="badge bg-primary bg-opacity-10 text-primary">{solicitud.area}</span>
        </div>
      </div>
    </div>
  )
}

// Columna por estado
function ColumnaKanban({ estado, solicitudes, color }) {
  const solicitudesFiltradas = solicitudes.filter((s) => s.estado === estado)
  const ids = solicitudesFiltradas.map((s) => s.id)

  return (
    <div className="col-12 col-lg-4 mb-3">
      <div className="card border-0 shadow-sm h-100">
        <div className={`card-header border-0 py-2 px-3 ${color} bg-opacity-10`}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold small">{estado}</span>
            <span className="badge bg-white text-dark border">{solicitudesFiltradas.length}</span>
          </div>
        </div>
        <div className="card-body p-2" style={{ minHeight: '400px' }}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {solicitudesFiltradas.map((solicitud) => (
              <TarjetaSolicitud key={solicitud.id} solicitud={solicitud} />
            ))}
          </SortableContext>
          {solicitudesFiltradas.length === 0 && (
            <div className="text-center text-muted small py-4">
              Sin solicitudes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function KanbanSolicitudes({ solicitudes, setSolicitudes }) {
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeSolicitud = solicitudes.find((s) => s.id === active.id)
    if (!activeSolicitud) return

    // Buscar la solicitud sobre la que soltamos
    const overSolicitud = solicitudes.find((s) => s.id === over.id)

    // Si soltamos sobre otra tarjeta, tomamos su estado. Si soltamos directamente sobre la columna (raro), usamos over.id
    const nuevoEstado = overSolicitud ? overSolicitud.estado : over.id

    // 1) Mover dentro de la MISMA columna -> reordenar
    if (activeSolicitud.estado === nuevoEstado) {
      setSolicitudes((prev) => {
        const columna = prev.filter((s) => s.estado === nuevoEstado)
        const otras = prev.filter((s) => s.estado !== nuevoEstado)

        const oldIndex = columna.findIndex((s) => s.id === active.id)
        const newIndex = columna.findIndex((s) => s.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return prev

        const columnaReordenada = arrayMove(columna, oldIndex, newIndex)

        // Mantenemos las otras columnas tal como estaban y ponemos esta reordenada
        return [...otras, ...columnaReordenada]
      })
      return
    }

    // 2) Mover ENTRE columnas -> cambiar estado
    if (ESTADOS.includes(nuevoEstado)) {
      setSolicitudes((prev) => {
        const otras = prev.filter((s) => s.id !== active.id)
        const movida = { ...activeSolicitud, estado: nuevoEstado }
        return [...otras, movida]
      })
    }
  }

  const activeSolicitud = activeId
    ? solicitudes.find((s) => s.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="row">
        <ColumnaKanban estado="Pendiente" solicitudes={solicitudes} color="bg-warning" />
        <ColumnaKanban estado="En proceso" solicitudes={solicitudes} color="bg-info" />
        <ColumnaKanban estado="Finalizada" solicitudes={solicitudes} color="bg-success" />
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeSolicitud ? (
          <div style={{ transform: 'rotate(3deg)', cursor: 'grabbing' }}>
            <TarjetaSolicitud solicitud={activeSolicitud} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}