import type { Lead } from 'src/api/leads';

import { useState, useEffect } from 'react';

import { fetchLeads } from 'src/api/leads';

export function useLeads(
    page: number,
    rowsPerPage: number,
    search: string,
    filterValues?: Record<string, any>,
    sortBy?: string
) {
    const [data, setData] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [trigger, setTrigger] = useState(0);

    const refetch = () => setTrigger((prev) => prev + 1);

    useEffect(() => {
        setLoading(true);

        fetchLeads({
            page: page + 1, // Frappe pages start from 1
            page_size: rowsPerPage,
            search,
            filterValues,
            sort_by: sortBy,
        })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
            })
            .catch((err) => {
                console.error("Failed to fetch leads", err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, search, filterValues, sortBy, trigger]);

    return { data, total, loading, refetch };
}

export function useKanbanLeads(
    search: string,
    filterValues?: Record<string, any>,
    sortBy?: string,
    enabled: boolean = false
) {
    const [data, setData] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [trigger, setTrigger] = useState(0);

    const refetch = () => {
        setPage(1);
        setTrigger((prev) => prev + 1);
    };

    const PAGE_SIZE = 100;

    useEffect(() => {
        if (!enabled) return;
        setLoading(true);

        fetchLeads({
            page: 1,
            page_size: PAGE_SIZE,
            search,
            filterValues,
            sort_by: sortBy,
        })
            .then((res) => {
                setData(res.data);
                setTotal(res.total);
                setPage(1);
            })
            .catch((err) => {
                console.error("Failed to fetch Kanban leads", err);
                setData([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [search, filterValues, sortBy, trigger, enabled]);

    const loadMore = async () => {
        if (loading || data.length >= total) return;
        setLoading(true);
        const nextPage = page + 1;
        try {
            const res = await fetchLeads({
                page: nextPage,
                page_size: PAGE_SIZE,
                search,
                filterValues,
                sort_by: sortBy,
            });
            setData((prev) => [...prev, ...res.data]);
            setTotal(res.total);
            setPage(nextPage);
        } catch (err) {
            console.error("Failed to load more Kanban leads", err);
        } finally {
            setLoading(false);
        }
    };

    const hasMore = data.length < total;

    return { data, loading, hasMore, loadMore, refetch };
}

