```javascript
import React, { useState, useRef } from 'react';
import { useActividades, useDeleteActividad } from '../hooks/useActividades';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "../components/ui/table";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Download, MapPin, Phone, DollarSign, Plus, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import ActividadModal from '../components/ActividadModal';

const AgendaDiaria = () => {
    const [selectedTech, setSelectedTech] = useState('all');
    const [filterDate, setFilterDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD for input date
    
    // Convert YYYY-MM-DD to Locale Date String (D/M/YYYY or similar based on backend expectation)
    // Backend likely expects standard local format if created with new Date().toLocaleDateString()
    // Let's ensure consistency. If backend saves as "2/2/2026", we need to send that.
    // For safety, let's parse the input date and format it.
    
    const formatDateForBackend = (isoDate) => {
        if (!isoDate) return 'all';
        const [year, month, day] = isoDate.split('-');
        return new Date(year, month - 1, day).toLocaleDateString();
    };

    const { data: actividades = [], isLoading } = useActividades({ 
        assigned_to: selectedTech === 'all' ? undefined : selectedTech,
        fecha: formatDateForBackend(filterDate)
    });

    const deleteMutation = useDeleteActividad();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActividad, setEditingActividad] = useState(null);
    const reportRef = useRef(null);

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

    const downloadWhatsAppImage = async () => {
        if (!reportRef.current) return;
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, backgroundColor: "#ffffff", useCORS: true
            });
            const image = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement("a");
            link.href = image;
            link.download = `Ruta_${ selectedTech }_${ filterDate }.jpg`;
            link.click();
        } catch (error) {
            console.error("Error generando imagen:", error);
            alert("Error al generar imagen.");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Cargando Agenda...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Agenda Diaria
                    </h1>
                    <p className="text-muted-foreground">
                        Gestión operativa y rutas de técnicos.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    {/* Date Picker for History */}
                    <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-card w-full sm:w-auto">
                        <CalendarIcon size={16} className="text-muted-foreground" />
                        <input 
                            type="date" 
                            className="bg-transparent border-none focus:outline-none text-sm"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>

                    <Select value={selectedTech} onValueChange={setSelectedTech}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar Técnico" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Técnicos</SelectItem>
                            <SelectItem value="Jairo">Jairo</SelectItem>
                            <SelectItem value="Armando">Armando</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Button onClick={handleCreate} className="w-full sm:w-auto gap-2">
                        <Plus size={18} /> Nueva Actividad
                    </Button>

                    {selectedTech !== 'all' && (
                        <Button onClick={downloadWhatsAppImage} variant="outline" className="w-full sm:w-auto gap-2 text-green-600 border-green-200 hover:bg-green-50">
                            <Download size={18} /> Generar Ruta
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Operaciones del Día: {formatDateForBackend(filterDate)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Técnico</TableHead>
                                <TableHead>Actividad</TableHead>
                                <TableHead className="hidden md:table-cell">Dirección</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {actividades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No hay actividades para esta fecha.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                actividades.map((act) => (
                                    <TableRow key={act._id}>
                                        <TableCell>
                                            <Badge variant={act.assigned_to === 'Por Asignar' ? 'destructive' : 'secondary'}>
                                                {act.assigned_to}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{act.tipo}</span>
                                                <span className="text-xs text-muted-foreground">{act.cliente}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-[200px] truncate">
                                                <MapPin size={12} /> {act.direccion}
                                            </div>
                                        </TableCell>
                                        <TableCell>{act.horario}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                act.estado === 'FINALIZADO' ? 'border-green-500 text-green-500' : 
                                                act.estado === 'EN_RUTA' ? 'border-blue-500 text-blue-500' : ''
                                            }>
                                                {act.estado}
                                            </Badge>
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

            {/* Modal Compartido */}
            <ActividadModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                actividadToEdit={editingActividad} 
            />

            {/* Reporte Oculto (Mismo de antes) */}
            <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                <div 
                    ref={reportRef} 
                    className="w-[450px] bg-white text-slate-900 p-6 border-4 border-slate-900"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                >
                    <div className="mb-6 border-b-2 border-slate-800 pb-4">
                        <h2 className="text-3xl font-black uppercase text-slate-800 mb-1">Ruta Técnica</h2>
                        <div className="flex justify-between items-end">
                            <span className="text-xl font-bold text-blue-700 uppercase">{selectedTech}</span>
                            <span className="text-md font-semibold text-slate-500">{formatDateForBackend(filterDate)}</span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {actividades.map((act, index) => (
                            <div key={act._id} className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-slate-800 text-white font-bold px-3 py-1 rounded-bl-lg text-sm">#{index + 1}</div>
                                <div className="mb-2">
                                    <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{act.horario} • {act.tipo}</span>
                                    <h3 className="text-lg font-black leading-tight text-slate-900 mb-1">{act.cliente}</h3>
                                    <div className="flex items-start gap-2 text-slate-700 bg-white p-2 rounded border border-slate-100"><MapPin size={20} className="shrink-0 mt-0.5 text-blue-600" /><p className="text-md font-medium leading-snug">{act.direccion}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div className="flex items-center gap-2 text-slate-600"><Phone size={16} /><span className="font-mono font-bold text-sm">{act.telefono}</span></div>
                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded"><DollarSign size={16} /><span className="font-bold text-lg">{act.costo}</span></div>
                                </div>
                                {act.notas && <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">⚠️ {act.notas}</div>}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center text-xs text-slate-400 font-mono border-t pt-4">Generado por Verkkom App</div>
                </div>
            </div>
        </div>
    );
};

export default AgendaDiaria;
