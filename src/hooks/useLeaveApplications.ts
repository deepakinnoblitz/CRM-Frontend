import { useState, useEffect, useCallback } from 'react';

import { fetchLeaveApplications } from 'src/api/leaves';

export function useLeaveApplications(
    page: number,
    pageSize: number,
    search: string,
    filters: any = {},
    orderBy: string = 'modified',
    order: 'asc' | 'desc' = 'desc'
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
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
            setLoading(false);
        }
    }, [page, pageSize, search, JSON.stringify(filters), orderBy, order]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}
