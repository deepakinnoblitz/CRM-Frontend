import type { Proposal } from 'src/api/proposal';

import { useState, useEffect } from 'react';

import { fetchProposals } from 'src/api/proposal';

// ----------------------------------------------------------------------

export function useProposals(
    page: number,
    rowsPerPage: number,
    search: string,
    sortBy?: string,
    filters?: {
        client_name?: string;
        status?: string;
        proposal_date?: string;
    }
) {
    const [data, setData] = useState<Proposal[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);

        fetchProposals({
            page: page + 1, // Frappe pages start from 1
            page_size: rowsPerPage,
            search,
            sort_by: sortBy,
            filters,
        })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error('Failed to fetch proposals', err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, sortBy, filters, trigger]);

    return { data, total, loading, refetch };
}
