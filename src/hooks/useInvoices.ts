import type { Invoice } from 'src/api/invoice';

import { useState, useEffect } from 'react';

import { fetchInvoices } from 'src/api/invoice';

export function useInvoices(
    page: number,
    rowsPerPage: number,
    search: string,
    filters?: {
        client_name?: string;
        ref_no?: string;
        invoice_date?: string | null;
    },
    sortBy?: string
) {
    const [data, setData] = useState<Invoice[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);

        fetchInvoices({
            page: page + 1, // Frappe pages start from 1
            page_size: rowsPerPage,
            search,
            filters,
            sort_by: sortBy,
        })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error("Failed to fetch invoices", err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, filters, sortBy, trigger]);

    return { data, total, loading, refetch };
}
