import React, { useState } from 'react';
import { useActividades, useCreateActividad, useUpdateActividad, useDeleteActividad } from '../hooks/useActividades';
import { Plus, Search, Calendar, CheckCircle2, AlertCircle, Clock, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';

// Simple Card Component (Inline to save files for now, or move to ui later)
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
    const [fechaFiltro, setFechaFiltro] = useState('all');
    const { data: actividades = [], isLoading, isError } = useActividades(fechaFiltro);
    const createMutation = useCreateActividad();
    const deleteMutation = useDeleteActividad();

    // Metrics Calculation
    const total = actividades.length;
    const pendientes = actividades.filter(a => a.estado === 'PENDIENTE').length;
    const terminados = actividades.filter(a => a.estado === 'TERMINADO').length;

    // UI State for Form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
        setIsFormOpen(false);
        setFormData({});
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Cargando dashboard...</div>;
    if (isError) return <div className="flex h-screen items-center justify-center text-destructive">Error al cargar datos</div>;

    return (
        <div className="min-h-screen bg-background p-8 font-sans">
            {/* HEADER */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Panel de Control</h1>
                    <p className="text-muted-foreground">Resumen de operaciones y agenda diaria.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm shadow-sm hidden md:flex">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nueva Actividad
                    </button>
                </div>
            </header>

            {/* METRICS GRID */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card title="Total Actividades" value={total} icon={Calendar} color="text-blue-500" subtext="Registradas hoy" />
                <Card title="Pendientes" value={pendientes} icon={Clock} color="text-yellow-500" subtext="Requieren atención" />
                <Card title="Terminados" value={terminados} icon={CheckCircle2} color="text-green-500" subtext="Completados con éxito" />
                <Card title="Eficiencia" value={`${total ? Math.round((terminados / total) * 100) : 0}%`} icon={AlertCircle} color="text-purple-500" subtext="Tasa de finalización" />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0">
                    <h3 className="font-semibold leading-none tracking-tight">Agenda de Actividades</h3>
                    {/* Simple Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFechaFiltro('all')}
                            className={cn("text-xs font-medium px-2.5 py-0.5 rounded", fechaFiltro === 'all' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFechaFiltro(new Date().toLocaleDateString())}
                            className={cn("text-xs font-medium px-2.5 py-0.5 rounded", fechaFiltro !== 'all' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
                        >
                            Hoy
                        </button>
                    </div>
                </div>
                <div className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">Horario</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Servicio</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Dirección</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {actividades.map((act) => (
                                    <tr key={act._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{act.horario || "--:--"}</td>
                                        <td className="p-4 align-middle font-semibold">{act.cliente}</td>
                                        <td className="p-4 align-middle">
                                            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                act.servicio?.toLowerCase().includes("fibra") ? "border-transparent bg-cyan-100 text-cyan-800 dark:text-cyan-100 dark:bg-cyan-900/50" : "border-transparent bg-orange-100 text-orange-800 dark:text-orange-100 dark:bg-orange-900/50"
                                            )}>
                                                {act.servicio}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle hidden md:table-cell text-muted-foreground">{act.direccion}</td>
                                        <td className="p-4 align-middle">
                                            <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                                act.estado === 'TERMINADO' ? "bg-green-50 text-green-700 ring-green-600/20" :
                                                    act.estado === 'PENDIENTE' ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" : "bg-gray-50 text-gray-600 ring-gray-500/10"
                                            )}>
                                                {act.estado}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <button className="text-muted-foreground hover:text-primary mr-2"><Edit2 className="h-4 w-4" /></button>
                                            <button onClick={() => deleteMutation.mutate(act._id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                                {actividades.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">No hay actividades registradas aún.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* SIMPLE MODAL FORM (Overlay) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg sm:p-8">
                        <h2 className="text-lg font-semibold mb-4">Nueva Actividad</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text" placeholder="Cliente" required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                                />
                                <input
                                    type="text" placeholder="Horario (ej. 14:00)"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    onChange={e => setFormData({ ...formData, horario: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    onChange={e => setFormData({ ...formData, servicio: e.target.value })}
                                >
                                    <option value="">Seleccionar Servicio</option>
                                    <option value="Instalación Fibra">Instalación Fibra</option>
                                    <option value="Soporte Técnico">Soporte Técnico</option>
                                    <option value="Antena">Antena</option>
                                </select>
                                <input
                                    type="text" placeholder="Costo"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    onChange={e => setFormData({ ...formData, costo: e.target.value })}
                                />
                            </div>
                            <input
                                type="text" placeholder="Dirección"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                    Cancelar
                                </button>
                                <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
