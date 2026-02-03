import { useState, useEffect, useCallback } from 'react';

import { fetchAttendance } from 'src/api/attendance';

export function useAttendance(
    page: number,
    pageSize: number,
    search: string,
    orderBy?: string,
    order?: 'asc' | 'desc',
    startDate?: string,
    endDate?: string,
    filterStatus?: string
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any[] = [];

            // Add date range filters
            if (startDate) {
                filters.push(['Attendance', 'attendance_date', '>=', startDate]);
            }
            if (endDate) {
                filters.push(['Attendance', 'attendance_date', '<=', endDate]);
            }

            // Add status filter
            if (filterStatus && filterStatus !== 'all') {
                filters.push(['Attendance', 'status', '=', filterStatus]);
            }

            const result = await fetchAttendance({
                page,
                page_size: pageSize,
                search,
                orderBy,
                order,
                filters: filters.length > 0 ? filters : undefined
            });
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, orderBy, order, startDate, endDate, filterStatus]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}
