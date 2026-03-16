import { useState, useEffect, useCallback } from 'react';

import { 
    fetchPersonalityTraits, 
    fetchPersonalityEvents, 
    fetchPersonalityScoreLogs 
} from 'src/api/personality';

export function usePersonalityTraits(page: number, pageSize: number, search?: string, sortBy?: string, filters?: any) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchPersonalityTraits({ 
                page, 
                page_size: pageSize, 
                search, 
                sort_by: sortBy,
                category: filters?.category
            });
            setData(res.data);
            setTotal(res.total);
        } catch (error) {
            console.error('Failed to fetch personality traits:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, sortBy, filters?.category]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}

export function usePersonalityEvents(page: number, pageSize: number, search?: string, sortBy?: string, filters?: any) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchPersonalityEvents({ 
                page, 
                page_size: pageSize, 
                search, 
                sort_by: sortBy,
                employee: filters?.employee,
                trait: filters?.trait,
                evaluation_type: filters?.evaluation_type,
                docstatus: filters?.docstatus
            });
            setData(res.data);
            setTotal(res.total);
        } catch (error) {
            console.error('Failed to fetch personality events:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, sortBy, filters?.employee, filters?.trait, filters?.evaluation_type, filters?.docstatus]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}

export function usePersonalityScoreLogs(page: number, pageSize: number, search?: string, sortBy?: string, filters?: any) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchPersonalityScoreLogs({ 
                page, 
                page_size: pageSize, 
                search, 
                sort_by: sortBy,
                employee: filters?.employee
            });
            setData(res.data);
            setTotal(res.total);
        } catch (error) {
            console.error('Failed to fetch personality score logs:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, sortBy, filters?.employee]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}
