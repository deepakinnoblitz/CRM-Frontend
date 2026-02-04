import { useState, useEffect, useCallback } from 'react';

import { fetchUploadAttendance } from 'src/api/upload-attendance';

export function useUploadAttendance(
    page: number,
    pageSize: number,
    search: string,
    orderBy?: string,
    order?: 'asc' | 'desc'
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchUploadAttendance({
                page,
                page_size: pageSize,
                search,
                orderBy,
                order
            });
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch upload attendance:', error);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, orderBy, order]);

    useEffect(() => {
        refetch();
    }, [page, pageSize, search, orderBy, order]);

    return { data, total, loading, refetch };
}
