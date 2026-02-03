import React, { useState, useEffect } from 'react';
import { useCreateActividad, useUpdateActividad } from '../hooks/useActividades';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'; // Assuming we have or will create a Dialog wrapper, or I'll use raw generic modal logic if Dialog not present
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input'; // Need to check if Input exists, otherwise standard input
import { Label } from './ui/label';   // Standard Shadcn label
import { X } from 'lucide-react';

// Simplified Modal without needing full Radix if we haven't installed it
const ModalOverlay = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
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
        created_by: 'OFICINA', // Could be dynamic based on login
        notas: ''
    });

    useEffect(() => {
        if (actividadToEdit) {
            // Reverse parse date from Locale String to YYYY-MM-DD for input
            // formats usually: D/M/YYYY or M/D/YYYY. We try to be smart.
            let isoDate = '';
            if (actividadToEdit.fecha) {
                // Check if it's already ISO
                if (actividadToEdit.fecha.includes('-') && actividadToEdit.fecha.length === 10) {
                    isoDate = actividadToEdit.fecha;
                } else {
                    // Attempt to parse locale string
                    const parts = actividadToEdit.fecha.split('/');
                    if (parts.length === 3) {
                        // Asumimos formato dia/mes/año o mes/dia/año... es ambiguo.
                        // Por consistencia con AgendaDiaria que usa new Date(), confiaremos en Date.parse o manual
                        // AgendaDiaria construye con (year, month-1, day).
                        // Vamos a asumir que lo que guardamos (Date.toLocaleDateString()) es parseable por Date
                        // Pero para el input necesitamos YYYY-MM-DD.

                        // Hack seguro: El input necesita YYYY-MM-DD
                        // Si es D/M/YYYY (comun en ES/LATAM) -> parts[2]-parts[1]-parts[0]
                        // Si es M/D/YYYY (US) -> parts[2]-parts[0]-parts[1]

                        // Vamos a intentar obtenerlo del objeto Date nativo si es posible
                        // O simplemente dejamos el input vacio si falla la conversion compleja
                        // Una opcion mejor: Cuando se edita, usamos la fecha tal cual si no podemos parsearla
                        // Pero el input type="date" mostrara vacio.

                        // Mejor intento:
                        const d = new Date(actividadToEdit.fecha); // Try standard parse
                        if (!isNaN(d.getTime())) {
                            isoDate = d.toISOString().split('T')[0];
                        }
                    }
                }
            }

            setFormData({
                ...actividadToEdit,
                fecha: isoDate || actividadToEdit.fecha // Fallback
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
                fecha: new Date().toLocaleDateString('en-CA') // Default YYYY-MM-DD
            });
        }
    }, [actividadToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Normalize Date to match Backend/AgendaDiaria expectation (Locale String)
            // formData.fecha comes as YYYY-MM-DD from input
            let payload = { ...formData };
            if (payload.fecha && payload.fecha.includes('-')) {
                const [year, month, day] = payload.fecha.split('-');
                // Create date object and format to local string
                // Note: Using the same logic as AgendaDiaria to ensure match
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
            <div className="grid gap-4 py-4">
                <h2 className="text-lg font-semibold tracking-tight">
                    {actividadToEdit ? 'Editar Actividad' : 'Nueva Actividad'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cliente</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                                value={formData.cliente}
                                onChange={e => handleChange('cliente', e.target.value)}
                                placeholder="Nombre del Cliente"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Horario</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.horario}
                                onChange={e => handleChange('horario', e.target.value)}
                                placeholder="Ej: 10:00 AM"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.costo}
                                onChange={e => handleChange('costo', e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    value={formData.direccion}
                    onChange={e => handleChange('direccion', e.target.value)}
                    placeholder="Calle, Número, Colonia"
                        />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Programada</label>
                <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.fecha || new Date().toISOString().split('T')[0]} // Default to today if missing
                    onChange={e => handleChange('fecha', e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.notas}
                    onChange={e => handleChange('notas', e.target.value)}
                    placeholder="Detalles adicionales..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
            </div >
        </ModalOverlay >
    );
};

export default ActividadModal;
