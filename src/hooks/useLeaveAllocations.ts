import { useState, useEffect, useCallback } from 'react';

import { fetchLeaveAllocations } from 'src/api/leave-allocations';

export function useLeaveAllocations(
    page: number,
    pageSize: number,
    search: string,
    filters: any = {},
    orderBy: string = 'creation',
    order: 'asc' | 'desc' = 'desc',
    refreshInterval?: number // Interval in ms
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const result = await fetchLeaveAllocations({
                page,
                page_size: pageSize,
                search,
                filters,
                orderBy,
                order
            });
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch leave allocations:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [page, pageSize, search, JSON.stringify(filters), orderBy, order]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Background refresh
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            const interval = setInterval(() => {
                refetch(true); // Silent refetch
            }, refreshInterval);
            return () => clearInterval(interval);
        }
        return undefined;
    }, [refreshInterval, refetch]);

    return { data, total, loading, refetch };
}
