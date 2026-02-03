import { useState, useEffect, useCallback } from 'react';

import { fetchLeaveApplications } from 'src/api/leaves';

export function useLeaveApplications(
    page: number,
    pageSize: number,
    search: string,
    filters: any = {},
    orderBy: string = 'modified',
    order: 'asc' | 'desc' = 'desc',
    refreshInterval?: number // Interval in ms
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const result = await fetchLeaveApplications({
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
            console.error('Failed to fetch leave applications:', error);
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
