import React, { useState } from 'react';
import { useActividades, useDeleteActividad } from '../hooks/useActividades';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, MapPin, Calendar, FileText, Edit2, Trash2 } from 'lucide-react';
import ActividadModal from '../components/ActividadModal';

const ActividadesSoporte = () => {
    const [selectedAgent, setSelectedAgent] = useState('all');

    // Support usually wants to see everything or filter by agent.
    // Assuming 'all' dates for now, or we could add a date filter too similar to Agenda.
    const { data: actividades = [], isLoading } = useActividades({
        created_by: selectedAgent === 'all' ? undefined : selectedAgent,
        fecha: 'all'
    });

    const deleteMutation = useDeleteActividad();
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
        if (confirm("¿Estás seguro de eliminar este ticket?")) {
            deleteMutation.mutate(id);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FINALIZADO': return 'bg-green-100 text-green-800 border-green-200';
            case 'EN_RUTA': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'VALIDANDO': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'PENDIENTE': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse">Cargando Bitácora de Soporte...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Bitácora de Soporte
                    </h1>
                    <p className="text-muted-foreground">
                        Control de tickets y reportes recibidos en oficina.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filtrar Agente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Agentes</SelectItem>
                            <SelectItem value="Dina">Dina</SelectItem>
                            <SelectItem value="Luz">Luz</SelectItem>
                            <SelectItem value="Brayan">Brayan</SelectItem>
                            <SelectItem value="OFICINA">General (Oficina)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleCreate} className="w-full md:w-auto gap-2">
                        <Plus size={18} /> Nuevo Ticket
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Historial de Casos</span>
                        <Badge variant="outline" className="ml-2">{actividades.length} Registros</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Fecha</TableHead>
                                <TableHead>Agente</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Detalles</TableHead>
                                <TableHead>Notas Internas</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {actividades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        No se encontraron tickets con los filtros seleccionados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                actividades.map((act) => (
                                    <TableRow key={act._id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-muted-foreground" />
                                                {act.fecha}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                    {(act.created_by || 'O').charAt(0)}
                                                </div>
                                                <span className="text-sm">{act.created_by || 'Oficina'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-foreground/80">
                                            {act.cliente}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <MapPin size={12} />
                                                    <span className="truncate max-w-[150px]" title={act.direccion}>{act.direccion}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                            {act.notas ? (
                                                <div className="flex items-start gap-1 text-sm text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                                                    <FileText size={12} className="mt-0.5 shrink-0" />
                                                    <p className="line-clamp-2" title={act.notas}>{act.notas}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Try adding notes...</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(act.estado)}`}>
                                                {act.estado}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(act)}>
                                                    <Edit2 size={16} className="text-blue-600" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(act._id)}>
                                                    <Trash2 size={16} className="text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ActividadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                actividadToEdit={editingActividad}
            />
        </div>
    );
};

export default ActividadesSoporte;
