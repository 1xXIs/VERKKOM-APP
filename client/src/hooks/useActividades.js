import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/actividades';

export function useActividades(fecha = 'all') {
    return useQuery({
        queryKey: ['actividades', fecha],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}?fecha=${fecha}`);
            return data;
        },
    });
}

export function useCreateActividad() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (nuevaActividad) => {
            const { data } = await axios.post(API_URL, nuevaActividad);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actividades'] });
        },
    });
}

export function useUpdateActividad() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...datos }) => {
            const { data } = await axios.put(`${API_URL}/${id}`, datos);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actividades'] });
        },
    });
}

export function useDeleteActividad() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(`${API_URL}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actividades'] });
        },
    });
}
