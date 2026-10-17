import { useState } from 'react';
import {
    DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable, useDraggable
} from '@dnd-kit/core';
import { ESTADOS } from '../data/catalogos';
import TarjetaSolicitud from './TarjetaSolicitud';

function TarjetaArrastrable({ solicitud }){
    const  { attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({ id: solicitud.id });
    const style = transform ? {transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50} : undefined;
    return(
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} 
        className={isDragging ? 'opacity-50' : ''} role="button">
        <TarjetaSolicitud solicitud={solicitud}/>
        </div>
    );
}

function Columna({ estado, solicitudes}){
    const { setNodeRef, isOver } = useDroppable({ id: estado });
    return(
        <div ref={setNodeRef} className={`p-2 rounded-3 h-100 ${isOver ? 'bg-primary-subtle' : 'bg-light'}`}>
            <div className='d-flex justify-content-between align-items-center mb-2 px-1'>
                <span className='fw-bold text-dark small text-uppercase'>{estado}</span>
                <span className='badge bg-white text-secondary border'>{solicitudes.length}</span>
            </div>
            {solicitudes.map((s) => <TarjetaArrastrable key={s.id} solicitud={s}/>)}
        </div>
    );
}

export default function KanbanSolicitudes({ solicitudes = [], busqueda = '', onMover}){
    const [activo, setActivo] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: { distance: 5} }));

    const filtradas = solicitudes.filter((s) => 
    s.candidato.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.rut.includes(busqueda) ||
    s.cargo.toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleDragStart = (e) => setActivo(filtradas.find((s) => s.id === e.active.id) || null);

    const handleDragEnd = ({ active, over}) => {
        setActivo(null);
        if (!over || !onMover) return;
        const sol = solicitudes.find((s) => s.id === active.id);
        if (sol && sol.estado !== over.id) onMover(active.id, over.id);
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className='row g-3'>
                {ESTADOS.map((estado) => (
                    <div key={estado} className='col-12 col-lg-4'>
                        <Columna estado={estado} solicitudes={filtradas.filter((s) => s.estado === estado)} />
                    </div>
                ))}
            </div>
            <DragOverlay>
                {activo ? (
                    <div style={{ transform: 'rotate(3deg)' }}>
                        <TarjetaSolicitud solicitud={activo} />
                    </div>
                 ) : null}
            </DragOverlay>
        </DndContext>
    );
}