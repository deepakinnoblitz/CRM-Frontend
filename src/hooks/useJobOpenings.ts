import { useState, useEffect, useCallback } from 'react';

import { fetchJobOpenings } from 'src/api/job-openings';

export function useJobOpenings(
    page: number,
    page_size: number,
    search: string,
    order_by?: string,
    order?: 'asc' | 'desc',
    filters?: {
        status?: string;
        location?: string;
        startDate?: string | null;
        endDate?: string | null;
    }
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchJobOpenings({
                page,
                page_size,
                search,
                orderBy: order_by,
                order,
                filters,
            });
            setData(result.data);
            setTotal(result.total);
            setError(null);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [page, page_size, search, order_by, order, filters]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, error, refetch };
}
