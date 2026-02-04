import { useState, useEffect, useCallback } from 'react';

import { fetchUsers } from 'src/api/users';

export function useUsers(
    page: number,
    pageSize: number,
    search: string,
    filterValues?: Record<string, any>,
    sort_by?: string,
    filterStatus?: string
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchUsers({
                page,
                page_size: pageSize,
                search,
                filterValues,
                sort_by,
                filterStatus
            });
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, filterValues, sort_by, filterStatus]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}
