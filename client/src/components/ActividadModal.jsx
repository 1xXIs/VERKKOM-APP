import React, { useState, useEffect } from 'react';
import { useCreateActividad, useUpdateActividad } from '../hooks/useActividades';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { X } from 'lucide-react';

const ModalOverlay = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-[95%] sm:max-w-lg rounded-lg border bg-card p-4 sm:p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200 my-auto">
            <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Cerrar</span>
            </button>
            {children}
        </div>
    </div>
);

const ActividadModal = ({ isOpen, onClose, actividadToEdit = null }) => {
    const createMutation = useCreateActividad();
    const updateMutation = useUpdateActividad();

    const [formData, setFormData] = useState({
        cliente: '',
        horario: '',
        servicio: '',
        direccion: '',
        telefono: '',
        costo: '',
        tipo: 'SOPORTE',
        estado: 'PENDIENTE',
        assigned_to: 'Por Asignar',
        created_by: 'OFICINA',
        notas: '',
        fecha: ''
    });

    useEffect(() => {
        if (actividadToEdit) {
            // Reverse parse date for input (YYYY-MM-DD)
            let isoDate = '';
            if (actividadToEdit.fecha) {
                if (actividadToEdit.fecha.includes('-') && actividadToEdit.fecha.length === 10) {
                    isoDate = actividadToEdit.fecha;
                } else {
                    const parts = actividadToEdit.fecha.split('/');
                    if (parts.length === 3) {
                        const d = new Date(actividadToEdit.fecha);
                        if (!isNaN(d.getTime())) {
                            isoDate = d.toISOString().split('T')[0];
                        }
                    }
                }
            }

            setFormData({
                ...actividadToEdit,
                fecha: isoDate || actividadToEdit.fecha
            });
        } else {
            setFormData({
                cliente: '',
                horario: '',
                servicio: '',
                direccion: '',
                telefono: '',
                costo: '',
                tipo: 'SOPORTE',
                estado: 'PENDIENTE',
                assigned_to: 'Por Asignar',
                created_by: 'OFICINA',
                notas: '',
                fecha: new Date().toLocaleDateString('en-CA')
            });
        }
    }, [actividadToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Normalize Date
            let payload = { ...formData };
            if (payload.fecha && payload.fecha.includes('-')) {
                const [year, month, day] = payload.fecha.split('-');
                payload.fecha = new Date(year, month - 1, day).toLocaleDateString();
            }

            if (actividadToEdit) {
                await updateMutation.mutateAsync({ id: actividadToEdit._id, ...payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onClose();
        } catch (error) {
            console.error("Error saving activity:", error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay onClose={onClose}>
            <div className="grid gap-4 py-2 sm:py-4">
                <h2 className="text-lg font-semibold tracking-tight">
                    {actividadToEdit ? 'Editar Actividad' : 'Nueva Actividad'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Responsiveness: 1 column on mobile, 2 columns on tablet/desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cliente</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                required
                                value={formData.cliente}
                                onChange={e => handleChange('cliente', e.target.value)}
                                placeholder="Nombre del Cliente"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Horario</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.horario}
                                onChange={e => handleChange('horario', e.target.value)}
                                placeholder="Ej: 10:00 AM"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Servicio / Tipo</label>
                            <Select value={formData.tipo} onValueChange={val => handleChange('tipo', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SOPORTE">Soporte Técnico</SelectItem>
                                    <SelectItem value="INSTALACION">Instalación</SelectItem>
                                    <SelectItem value="MIGRACION">Migración</SelectItem>
                                    <SelectItem value="FIBRA">Fibra Óptica</SelectItem>
                                    <SelectItem value="ANTENA">Antena</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Costo ($)</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.costo}
                                onChange={e => handleChange('costo', e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Dirección</label>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.direccion}
                            onChange={e => handleChange('direccion', e.target.value)}
                            placeholder="Calle, Número, Colonia"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha Programada</label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.fecha || ''}
                            onChange={e => handleChange('fecha', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Técnico Asignado</label>
                            <Select value={formData.assigned_to} onValueChange={val => handleChange('assigned_to', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Técnico" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Por Asignar">Por Asignar</SelectItem>
                                    <SelectItem value="Jairo">Jairo</SelectItem>
                                    <SelectItem value="Armando">Armando</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Registrado Por</label>
                            <Select value={formData.created_by} onValueChange={val => handleChange('created_by', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Agente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OFICINA">Oficina (General)</SelectItem>
                                    <SelectItem value="Dina">Dina</SelectItem>
                                    <SelectItem value="Luz">Luz</SelectItem>
                                    <SelectItem value="Brayan">Brayan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notas / Observaciones</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={formData.notas}
                            onChange={e => handleChange('notas', e.target.value)}
                            placeholder="Detalles adicionales..."
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
                        <Button type="submit" className="w-full sm:w-auto">Guardar</Button>
                    </div>
                </form>
            </div>
        </ModalOverlay>
    );
};

export default ActividadModal;
