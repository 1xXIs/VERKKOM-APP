import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api/actividades`;

export function useActividades(filters = {}) {
    // Si se pasa un string (backward compatibility), lo tratamos como 'fecha'
    const queryFilters = typeof filters === 'string' ? { fecha: filters } : filters;

    return useQuery({
        queryKey: ['actividades', queryFilters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(queryFilters).forEach(([key, value]) => {
                if (value && value !== 'all') params.append(key, value);
            });

            const { data } = await axios.get(`${API_URL}?${params.toString()}`);
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
