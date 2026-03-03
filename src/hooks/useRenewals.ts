import { useState, useEffect, useCallback } from 'react';

import { fetchRenewals } from 'src/api/renewal-tracker';

export function useRenewals(
    page: number,
    page_size: number,
    search: string,
    orderBy?: string,
    order?: 'asc' | 'desc',
    filters?: {
        category?: string;
        status?: string;
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
            const result = await fetchRenewals({
                page,
                page_size,
                search,
                orderBy,
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
    }, [page, page_size, search, orderBy, order, filters]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, error, refetch };
}
