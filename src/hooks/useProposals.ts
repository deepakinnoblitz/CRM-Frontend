import type { Proposal } from 'src/api/proposal';

import { useState, useEffect } from 'react';

import { getAccount } from 'src/api/accounts';
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
            .then(async (res) => {
                const fetchedData = res.data;
                const billingIds = Array.from(new Set(fetchedData.map((d: any) => d.billing_name).filter(Boolean)));
                if (billingIds.length > 0) {
                    try {
                        const accountPromises = billingIds.map((id: any) => getAccount(id).catch(() => null));
                        const accounts = await Promise.all(accountPromises);
                        const accountMap = billingIds.reduce((acc: Record<string, string>, id: any, index) => {
                            if (accounts[index] && accounts[index].account_name) {
                                acc[id] = accounts[index].account_name;
                            }
                            return acc;
                        }, {} as Record<string, string>);
                        
                        fetchedData.forEach((d: any) => {
                            if (d.billing_name && accountMap[d.billing_name]) {
                                d.billing_account_name = accountMap[d.billing_name];
                            }
                        });
                    } catch (e) {
                        console.error('Failed to fetch billing account names', e);
                    }
                }
                setData(fetchedData);
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
