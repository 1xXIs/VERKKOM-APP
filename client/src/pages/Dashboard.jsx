import React, { useState } from 'react';
import { useActividades, useDeleteActividad } from '../hooks/useActividades';
import { Clock, Calendar, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import ActividadModal from '../components/ActividadModal';

// Simple Card Component
const Card = ({ title, value, icon: Icon, trend, color, subtext }) => (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
            <Icon className={cn("h-4 w-4", color)} />
        </div>
        <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">
                {trend && <span className={cn("font-medium", trend > 0 ? "text-green-500" : "text-red-500")}>
                    {trend > 0 ? "+" : ""}{trend}%
                </span>} {subtext}
            </p>
        </div>
    </div>
);

export default function Dashboard() {
    // Default to 'all' or specific date if needed. Keeping simple filters for Dashboard view.
    const [fechaFiltro, setFechaFiltro] = useState(new Date().toLocaleDateString()); // Default to TODAY for a dashboard

    // Helper to format for backend if selecting "Hoy"
    const formatDateForBackend = (dateString) => {
        if (dateString === 'all') return 'all';
        // If it's already in locale string format matching backend expectation, useful.
        // But our hook expects specific format or 'all'. 
        // Let's assume the hook handles the locale date string well or we pass 'all'.
        return dateString;
    };

    const { data: actividades = [], isLoading, isError } = useActividades({ fecha: fechaFiltro });
    const deleteMutation = useDeleteActividad();

    // Metrics Calculation
    const total = actividades.length;
    const pendientes = actividades.filter(a => a.estado === 'PENDIENTE').length;
    const terminados = actividades.filter(a => a.estado === 'TERMINADO').length;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActividad, setEditingActividad] = useState(null);

    const handleCreate = () => {
        setEditingActividad(null);
        setIsModalOpen(true);
    };

    const handleEdit = (actividad) => {
        setEditingActividad(actividad);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("¿Estás seguro de eliminar esta actividad?")) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Cargando dashboard...</div>;
    if (isError) return <div className="flex h-screen items-center justify-center text-destructive">Error al cargar datos</div>;

    return (
        <div className="min-h-screen bg-background p-8 font-sans">
            {/* HEADER */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Panel de Control</h1>
                    <p className="text-muted-foreground">Resumen de operaciones y agenda diaria.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm shadow-sm hidden md:flex">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus size={16} /> Nueva Actividad
                    </Button>
                </div>
            </header>

            {/* METRICS GRID */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card title="Total Actividades" value={total} icon={Calendar} color="text-blue-500" subtext="En vista actual" />
                <Card title="Pendientes" value={pendientes} icon={Clock} color="text-yellow-500" subtext="Requieren atención" />
                <Card title="Terminados" value={terminados} icon={CheckCircle2} color="text-green-500" subtext="Completados con éxito" />
                <Card title="Eficiencia" value={`${total ? Math.round((terminados / total) * 100) : 0}%`} icon={AlertCircle} color="text-purple-500" subtext="Tasa de finalización" />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="font-semibold leading-none tracking-tight">Agenda de Actividades</h3>
                    {/* Simple Filter */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setFechaFiltro('all')}
                            className={cn("text-xs font-medium px-2.5 py-1 flex-1 sm:flex-none text-center rounded", fechaFiltro === 'all' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFechaFiltro(new Date().toLocaleDateString())}
                            className={cn("text-xs font-medium px-2.5 py-1 flex-1 sm:flex-none text-center rounded", fechaFiltro !== 'all' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
                        >
                            Hoy
                        </button>
                    </div>
                </div>
                <div className="p-0">
                    <div className="relative w-full overflow-x-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-10 px-2 sm:px-4 text-left align-middle font-medium text-muted-foreground">Técnico</th>
                                    <th className="h-10 px-2 sm:px-4 text-left align-middle font-medium text-muted-foreground max-w-[150px]">Actividad</th>
                                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Dirección</th>
                                    <th className="h-10 px-2 sm:px-4 text-left align-middle font-medium text-muted-foreground">Horario</th>
                                    <th className="h-10 px-2 sm:px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">Estado</th>
                                    <th className="h-10 px-2 sm:px-4 text-right align-middle font-medium text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {actividades.map((act) => (
                                    <tr key={act._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-2 sm:p-4 align-middle">
                                            <Badge variant={act.assigned_to === 'Por Asignar' ? 'destructive' : 'secondary'} className="text-[10px] sm:text-xs whitespace-nowrap">
                                                {act.assigned_to}
                                            </Badge>
                                        </td>
                                        <td className="p-2 sm:p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm truncate max-w-[120px] sm:max-w-none">{act.tipo}</span>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">{act.cliente}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle hidden lg:table-cell">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-[200px] truncate">
                                                <MapPin size={12} /> {act.direccion}
                                            </div>
                                        </td>
                                        <td className="p-2 sm:p-4 align-middle font-medium text-xs sm:text-sm whitespace-nowrap">{act.horario || "--:--"}</td>
                                        <td className="p-2 sm:p-4 align-middle hidden sm:table-cell">
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] sm:text-xs",
                                                act.estado === 'TERMINADO' ? 'border-green-500 text-green-500' :
                                                    act.estado === 'EN_RUTA' ? 'border-blue-500 text-blue-500' : ''
                                            )}>
                                                {act.estado}
                                            </Badge>
                                        </td>
                                        <td className="p-2 sm:p-4 align-middle text-right">
                                            <div className="flex justify-end gap-1 sm:gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(act)}>
                                                    <Edit2 size={14} className="text-blue-600" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(act._id)}>
                                                    <Trash2 size={14} className="text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {actividades.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">No hay actividades registradas en esta vista.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Shared Modal for Create/Edit */}
            <ActividadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                actividadToEdit={editingActividad}
            />
        </div>
    );
}
