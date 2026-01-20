import type { Deal } from 'src/api/deals';

import { useState, useEffect } from 'react';

import { fetchDeals } from 'src/api/deals';

export function useDeals(
    page: number,
    pageSize: number,
    search?: string,
    stage?: string,
    sortBy?: string,
    filterValues?: Record<string, any>
) {
    const [data, setData] = useState<Deal[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);

        fetchDeals({
            page: page + 1, // Frappe pages start from 1
            page_size: pageSize,
            search,
            stage,
            sort_by: sortBy,
            filterValues,
        })
            .then((res) => {
                if (res && typeof res === 'object' && 'data' in res) {
                    setData(res.data);
                    setTotal(res.total || 0);
                } else if (Array.isArray(res)) {
                    // Fallback cast to any to avoid TS error
                    const results = res as any;
                    setData(results);
                    setTotal(results.length);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch deals", err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, pageSize, search, stage, trigger, sortBy, filterValues]);

    return { data, total, loading, refetch };
}
