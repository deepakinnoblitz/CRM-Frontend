import type { InvoiceCollection } from 'src/api/invoice-collection';

import { useState, useEffect } from 'react';

import { fetchInvoiceCollections } from 'src/api/invoice-collection';

export function useInvoiceCollections(
    page: number,
    rowsPerPage: number,
    search: string,
    filters?: {
        invoice?: string;
        customer?: string;
        collection_date?: string | null;
        mode_of_payment?: string;
    },
    sortBy?: string
) {
    const [invoiceCollections, setInvoiceCollections] = useState<InvoiceCollection[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);

        fetchInvoiceCollections({
            page: page + 1, // Frappe pages start from 1
            page_size: rowsPerPage,
            search,
            filters,
            sort_by: sortBy,
        })
            .then((res) => {
                setInvoiceCollections(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error("Failed to fetch invoice collections", err);
                setInvoiceCollections([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, filters, sortBy, trigger]);

    return { invoiceCollections, total, loading, refetch };
}
