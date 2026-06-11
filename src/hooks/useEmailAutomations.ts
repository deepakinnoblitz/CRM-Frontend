import type { EmailAutomation } from 'src/api/email-automation';

import { useState, useEffect } from 'react';

import { fetchEmailAutomations } from 'src/api/email-automation';

// ----------------------------------------------------------------------

export function useEmailAutomations(
    page: number,
    rowsPerPage: number,
    search: string,
    sortBy?: string,
    filters?: { status?: string; target_type?: string; is_active?: string }
) {
    const [data, setData] = useState<EmailAutomation[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);
        fetchEmailAutomations({ page: page + 1, page_size: rowsPerPage, search, sort_by: sortBy, filters })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error('Failed to fetch email automations', err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, sortBy, filters, trigger]);

    return { data, total, loading, refetch };
}
