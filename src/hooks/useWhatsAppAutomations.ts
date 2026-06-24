import type { WhatsAppAutomation } from 'src/api/whatsapp-automation';

import { useState, useEffect } from 'react';

import { fetchWhatsAppAutomations } from 'src/api/whatsapp-automation';

// ----------------------------------------------------------------------

export function useWhatsAppAutomations(
    page: number,
    rowsPerPage: number,
    search: string,
    sortBy?: string,
    filters?: { whatsapp_template?: string; document_type?: string; is_active?: string }
) {
    const [data, setData] = useState<WhatsAppAutomation[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);
        fetchWhatsAppAutomations({ page: page + 1, page_size: rowsPerPage, search, sort_by: sortBy, filters })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error('Failed to fetch WhatsApp automations', err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, sortBy, filters, trigger]);

    return { data, total, loading, refetch };
}
