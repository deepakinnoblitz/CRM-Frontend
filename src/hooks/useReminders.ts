import { useState, useEffect, useCallback } from 'react';

import { fetchHRReminders } from 'src/api/reminders';

// ----------------------------------------------------------------------

export function useHRReminders(page: number, pageSize: number, search?: string, sortBy?: string) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchHRReminders({
                page,
                page_size: pageSize,
                search,
                sort_by: sortBy,
            });
            setData(res.data);
            setTotal(res.total);
        } catch (error) {
            console.error('Failed to fetch HR reminders:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, sortBy]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}
