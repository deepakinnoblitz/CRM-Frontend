import type { Expense } from 'src/api/expenses';

import { useState, useEffect } from 'react';

import { fetchExpenses } from 'src/api/expenses';

export function useExpense(
    page: number,
    rowsPerPage: number,
    search: string,
    sortBy?: string
) {
    const [data, setData] = useState<Expense[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);

        fetchExpenses({
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
                console.error("Failed to fetch expenses", err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, sortBy, trigger]);

    return { data, total, loading, refetch };
}
