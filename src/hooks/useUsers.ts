import { useState, useEffect, useCallback } from 'react';

import { fetchUsers } from 'src/api/users';

export function useUsers(
    page: number,
    pageSize: number,
    search: string,
    sort_by?: string,
    filters?: { user_type?: string; role_profile_name?: string; enabled?: string }
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
                sort_by,
                filters
            });
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, search, sort_by, filters]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, total, loading, refetch };
}
