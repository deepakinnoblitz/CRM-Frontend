import { useState, useEffect, useCallback } from 'react';

import { fetchRequests } from 'src/api/requests';

export function useRequests(
    page: number,
    pageSize: number,
    search: string,
    orderBy?: string,
    order?: 'asc' | 'desc',
    startDate?: string,
    endDate?: string,
    status?: string,
    employee?: string,
    socket?: any
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const result = await fetchRequests({
                page,
                page_size: pageSize,
                search,
                orderBy,
                order,
                startDate,
                endDate,
                status,
                employee
            });
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [page, pageSize, search, orderBy, order, startDate, endDate, status, employee]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Real-time socket subscription — instant refresh when a Request status changes
    useEffect(() => {
        if (!socket) return undefined;

        const handleUpdate = () => {
            refetch(true); // Silent refetch — no loading spinner
        };

        socket.on('request_updated', handleUpdate);
        return () => {
            socket.off('request_updated', handleUpdate);
        };
    }, [socket, refetch]);

    return { data, total, loading, refetch };
}
