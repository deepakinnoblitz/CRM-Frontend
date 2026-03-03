import { useState, useEffect, useCallback } from 'react';

import { fetchAssetAssignments } from 'src/api/asset-assignments';

export function useAssetAssignments(
    page: number,
    pageSize: number,
    search: string,
    orderBy?: string,
    order?: 'asc' | 'desc',
    filters?: {
        employee?: string;
        status?: string;
        startDate?: string | null;
        endDate?: string | null;
    }
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchAssetAssignments({
                page,
                page_size: pageSize,
                search,
                orderBy,
                order,
                filters
            });
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch asset assignments:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, orderBy, order, filters]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}
