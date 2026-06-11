import type { EmailCampaign } from 'src/api/email-campaign';

import { useState, useEffect } from 'react';

import { fetchEmailCampaigns } from 'src/api/email-campaign';

// ----------------------------------------------------------------------

export function useEmailCampaigns(
    page: number,
    rowsPerPage: number,
    search: string,
    sortBy?: string,
    filters?: { status?: string; target_type?: string }
) {
    const [data, setData] = useState<EmailCampaign[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);
        fetchEmailCampaigns({ page: page + 1, page_size: rowsPerPage, search, sort_by: sortBy, filters })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error('Failed to fetch email campaigns', err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, sortBy, filters, trigger]);

    return { data, total, loading, refetch };
}
