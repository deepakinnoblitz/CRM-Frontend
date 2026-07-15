import type { EmailTemplate } from 'src/api/email-template';

import { useState, useEffect } from 'react';

import { fetchEmailTemplates } from 'src/api/email-template';

// ----------------------------------------------------------------------

export function useEmailTemplates(
    page: number,
    rowsPerPage: number,
    search: string,
    sortBy?: string,
    filters?: { category?: string; is_active?: string }
) {
    const [data, setData] = useState<EmailTemplate[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);
        fetchEmailTemplates({ page: page + 1, page_size: rowsPerPage, search, sort_by: sortBy, filters })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error('Failed to fetch email templates', err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, sortBy, filters, trigger]);

    return { data, total, loading, refetch };
}
