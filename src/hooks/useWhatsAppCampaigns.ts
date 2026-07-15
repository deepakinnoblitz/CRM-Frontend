import type { WhatsAppCampaign } from 'src/api/whatsapp-campaign';

import { useState, useEffect } from 'react';

import { fetchWhatsAppCampaigns } from 'src/api/whatsapp-campaign';

// ----------------------------------------------------------------------

export function useWhatsAppCampaigns(
    page: number,
    rowsPerPage: number,
    search: string,
    sortBy?: string,
    filters?: { status?: string; target_type?: string }
) {
    const [data, setData] = useState<WhatsAppCampaign[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);
        fetchWhatsAppCampaigns({ page: page + 1, page_size: rowsPerPage, search, sort_by: sortBy, filters })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error('Failed to fetch WhatsApp campaigns', err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, sortBy, filters, trigger]);

    return { data, total, loading, refetch };
}
