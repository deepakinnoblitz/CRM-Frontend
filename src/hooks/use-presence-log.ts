import { useState, useEffect, useCallback } from 'react';

import { fetchDetailedSessions } from 'src/api/presence-log';

// ----------------------------------------------------------------------

export function usePresenceLog(
    limitStart: number = 0,
    limitPageLength: number = 10,
    dateSearch: string = '',
    status: string = 'all',
    sortBy: string = 'login_date_desc'
) {
    const [data, setData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchDetailedSessions(limitStart, limitPageLength, dateSearch, status, sortBy);
            setData(result.data || []);
            setTotalCount(result.total_count || 0);
        } catch (err: any) {
            console.error('Failed to fetch presence logs:', err);
            setError(err.message || 'Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    }, [limitStart, limitPageLength, dateSearch, status, sortBy]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, totalCount, loading, error, refetch };
}
