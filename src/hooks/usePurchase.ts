import type { Purchase } from 'src/api/purchase';

import { useState, useEffect } from 'react';

import { fetchPurchases } from 'src/api/purchase';

export function usePurchase(
    page: number,
    rowsPerPage: number,
    search: string,
    sortBy?: string
) {
    const [data, setData] = useState<Purchase[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);

        fetchPurchases({
            page: page + 1, // Frappe pages start from 1
            page_size: rowsPerPage,
            search,
            sort_by: sortBy,
        })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error("Failed to fetch purchases", err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, sortBy, trigger]);

    return { data, total, loading, refetch };
}