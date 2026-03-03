import { useState, useEffect, useCallback } from 'react';

import { fetchReimbursementClaims } from 'src/api/reimbursement-claims';

export function useReimbursementClaims(
    page: number,
    pageSize: number,
    search: string = '',
    orderBy: string = 'date_of_expense',
    order: 'asc' | 'desc' = 'desc',
    filters?: {
        paid?: number | string | null;
        claim_type?: string;
        startDate?: string | null;
        endDate?: string | null;
    },
    socket?: any
) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const result = await fetchReimbursementClaims({
                page,
                page_size: pageSize,
                search,
                orderBy,
                order,
                filters,
            });
            setData(result.data);
            setTotal(result.total);
        } catch (error) {
            console.error('Failed to fetch reimbursement claims:', error);
            setData([]);
            setTotal(0);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [page, pageSize, search, orderBy, order, filters]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Real-time socket subscription — instant refresh when a Reimbursement Claim changes
    useEffect(() => {
        if (!socket) return undefined;

        const handleUpdate = () => {
            refetch(true); // Silent refetch — no loading spinner
        };

        socket.on('reimbursement_claim_updated', handleUpdate);
        return () => {
            socket.off('reimbursement_claim_updated', handleUpdate);
        };
    }, [socket, refetch]);

    return { data, total, loading, refetch };
}
