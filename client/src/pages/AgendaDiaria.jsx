import React, { useState, useRef } from 'react';
import { useActividades, useUpdateActividad } from '../hooks/useActividades';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Download, messageCircle, MapPin, Phone, DollarSign, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';

const AgendaDiaria = () => {
    const [selectedTech, setSelectedTech] = useState('all');
    // Filtramos por fecha 'hoy' por defecto, pero podrías hacerlo dinámico
    // Nota: El backend usa 'new Date().toLocaleDateString()' por defecto si no enviamos fecha
    const { data: actividades = [], isLoading } = useActividades({
        assigned_to: selectedTech === 'all' ? undefined : selectedTech,
        fecha: new Date().toLocaleDateString() // Aseguramos que sea hoy
    });

    const reportRef = useRef(null);

    const downloadWhatsAppImage = async () => {
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Mejor calidad
                backgroundColor: "#ffffff",
                useCORS: true // Si hay imágenes externas
            });

            const image = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement("a");
            link.href = image;
            link.download = `Rut_Tecnica_${selectedTech}_${new Date().toLocaleDateString().replace(/\//g, '-')}.jpg`;
            link.click();
        } catch (error) {
            console.error("Error generando imagen:", error);
            alert("Hubo un error al generar la imagen. Revisa la consola.");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Cargando Agenda...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Agenda Diaria
                    </h1>
                    <p className="text-muted-foreground">
                        Gestión de rutas y asignaciones para hoy ({new Date().toLocaleDateString()}).
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={selectedTech} onValueChange={setSelectedTech}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar Técnico" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Técnicos</SelectItem>
                            <SelectItem value="Jairo">Jairo</SelectItem>
                            <SelectItem value="Armando">Armando</SelectItem>
                        </SelectContent>
                    </Select>

                    {selectedTech !== 'all' && (
                        <Button onClick={downloadWhatsAppImage} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                            <Download size={18} />
                            Generar Imagen WhatsApp
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabla Principal de Gestión */}
            <Card>
                <CardHeader>
                    <CardTitle>Operaciones en Campo</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Folio</TableHead>
                                <TableHead>Técnico</TableHead>
                                <TableHead>Servicio</TableHead>
                                <TableHead>Cliente / Dirección</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Cobro</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {actividades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No hay actividades asignadas para hoy con este filtro.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                actividades.map((act) => (
                                    <TableRow key={act._id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {act._id?.slice(-6)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={act.assigned_to === 'Por Asignar' ? 'destructive' : 'secondary'}>
                                                {act.assigned_to}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {act.tipo} - {act.servicio}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{act.cliente}</span>
                                                <span className="text-xs text-muted-foreground">{act.direccion}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{act.horario}</TableCell>
                                        <TableCell className="font-semibold text-green-600">
                                            {act.costo}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                act.estado === 'FINALIZADO' ? 'border-green-500 text-green-500' :
                                                    act.estado === 'EN_RUTA' ? 'border-blue-500 text-blue-500' : ''
                                            }>
                                                {act.estado}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Componente Oculto para Generación de Imagen (Solo visible off-screen o absolute) */}
            {/* Truco: Lo renderizamos pero con posición absoluta y z-index negativo para que no estorbe pero html2canvas lo vea */}
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
                            <span className="text-md font-semibold text-slate-500">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {actividades.map((act, index) => (
                            <div key={act._id} className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50 shadow-sm relative overflow-hidden">
                                {/* Número de Parada */}
                                <div className="absolute top-0 right-0 bg-slate-800 text-white font-bold px-3 py-1 rounded-bl-lg text-sm">
                                    #{index + 1}
                                </div>

                                {/* Info Principal (Grande para celular) */}
                                <div className="mb-2">
                                    <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                                        {act.horario} • {act.tipo}
                                    </span>
                                    <h3 className="text-lg font-black leading-tight text-slate-900 mb-1">
                                        {act.cliente}
                                    </h3>
                                    <div className="flex items-start gap-2 text-slate-700 bg-white p-2 rounded border border-slate-100">
                                        <MapPin size={20} className="shrink-0 mt-0.5 text-blue-600" />
                                        <p className="text-md font-medium leading-snug">
                                            {act.direccion}
                                        </p>
                                    </div>
                                </div>

                                {/* Detalles Secundarios */}
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone size={16} />
                                        <span className="font-mono font-bold text-sm">{act.telefono}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded">
                                        <DollarSign size={16} />
                                        <span className="font-bold text-lg">{act.costo}</span>
                                    </div>
                                </div>

                                {act.notas && (
                                    <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                                        ⚠️ {act.notas}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-400 font-mono border-t pt-4">
                        Generado por Verkkom App • {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgendaDiaria;
