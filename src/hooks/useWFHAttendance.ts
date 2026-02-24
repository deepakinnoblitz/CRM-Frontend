import { useState, useEffect, useCallback } from 'react';

import { fetchWFHAttendance } from 'src/api/wfh-attendance';

export function useWFHAttendance(
    page: number,
    pageSize: number,
    search: string,
    orderBy?: string,
    order?: 'asc' | 'desc',
    filters?: { employee?: string; status?: string; startDate?: string | null; endDate?: string | null },
    socket?: any
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const result = await fetchWFHAttendance({
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
            console.error('Failed to fetch WFH attendance:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [page, pageSize, search, orderBy, order, filters]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Real-time socket subscription — instant refresh when a WFH Attendance status changes
    useEffect(() => {
        if (!socket) return undefined;

        const handleUpdate = () => {
            refetch(true); // Silent refetch — no loading spinner
        };

        socket.on('wfh_attendance_updated', handleUpdate);
        return () => {
            socket.off('wfh_attendance_updated', handleUpdate);
        };
    }, [socket, refetch]);

    return { data, total, loading, refetch };
}
