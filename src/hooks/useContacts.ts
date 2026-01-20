import { useState, useEffect, useCallback } from 'react';

import { fetchContacts } from 'src/api/contacts';

export function useContacts(
    page: number,
    pageSize: number,
    search?: string,
    filterValues?: Record<string, any>,
    sortBy?: string
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchContacts({ page, page_size: pageSize, search, filterValues, sort_by: sortBy });
            // Handle new response structure with data and total
            if (res && typeof res === 'object' && 'data' in res) {
                setData(res.data);
                setTotal(res.total || res.data.length);
            } else if (Array.isArray(res)) {
                // Keep this as a safe fallback, but cast to any to avoid 'never' error
                const results = res as any;
                setData(results);
                setTotal(results.length);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, filterValues, sortBy]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, total, loading, refetch: fetchData };
}
