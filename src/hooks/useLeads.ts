import type { Lead } from 'src/api/leads';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    enabled: boolean = false,
    workflowStates: string[] = []
) {
    const [columns, setColumns] = useState<Record<string, {
        leads: Lead[];
        page: number;
        loading: boolean;
        hasMore: boolean;
    }>>({});

    const [trigger, setTrigger] = useState(0);

    const paramsRef = useRef({ search, filterValues, sortBy, enabled, workflowStates });
    useEffect(() => {
        paramsRef.current = { search, filterValues, sortBy, enabled, workflowStates };
    }, [search, filterValues, sortBy, enabled, workflowStates]);

    const fetchColumn = useCallback(async (stage: string, pageNum: number) => {
        const currentParams = paramsRef.current;
        if (!currentParams.enabled) return;

        // If the filter specifically narrows down workflow_state and it's not 'all' and is not this stage,
        // this column should display zero leads without hitting the API.
        if (currentParams.filterValues?.workflow_state &&
            currentParams.filterValues.workflow_state !== 'all' &&
            currentParams.filterValues.workflow_state !== stage) {
            setColumns(prev => ({
                ...prev,
                [stage]: {
                    leads: [],
                    page: 1,
                    loading: false,
                    hasMore: false
                }
            }));
            return;
        }

        setColumns(prev => ({
            ...prev,
            [stage]: {
                ...(prev[stage] || { leads: [], page: pageNum }),
                loading: true
            }
        }));

        try {
            const stageFilters = { ...currentParams.filterValues };
            stageFilters.workflow_state = stage;

            const res = await fetchLeads({
                page: pageNum,
                page_size: 20, // batch size of 20
                search: currentParams.search,
                filterValues: stageFilters,
                sort_by: currentParams.sortBy
            });

            setColumns(prev => {
                const currentLeads = prev[stage]?.leads || [];
                const newLeads = pageNum === 1 ? res.data : [...currentLeads, ...res.data];
                const hasMore = newLeads.length < res.total;
                return {
                    ...prev,
                    [stage]: {
                        leads: newLeads,
                        page: pageNum,
                        loading: false,
                        hasMore
                    }
                };
            });
        } catch (err) {
            console.error(`Failed to fetch Kanban leads for stage: ${stage}`, err);
            setColumns(prev => ({
                ...prev,
                [stage]: {
                    ...(prev[stage] || { leads: [], page: pageNum }),
                    loading: false,
                    hasMore: false
                }
            }));
        }
    }, []);

    // Initial fetch/reset when filters or trigger changes
    useEffect(() => {
        if (!enabled || workflowStates.length === 0) return;

        const initialColumns: Record<string, { leads: Lead[]; page: number; loading: boolean; hasMore: boolean }> = {};
        workflowStates.forEach(stage => {
            initialColumns[stage] = {
                leads: [],
                page: 1,
                loading: true,
                hasMore: false
            };
        });
        setColumns(initialColumns);

        workflowStates.forEach(stage => {
            fetchColumn(stage, 1);
        });
    }, [search, filterValues, sortBy, workflowStates, enabled, trigger, fetchColumn]);

    const refetch = useCallback((stage?: string | string[]) => {
        if (stage) {
            const stages = Array.isArray(stage) ? stage : [stage];
            stages.forEach(st => {
                fetchColumn(st, 1);
            });
        } else {
            setTrigger(prev => prev + 1);
        }
    }, [fetchColumn]);

    const columnsData = useMemo(() => {
        const result: Record<string, {
            leads: Lead[];
            hasMore: boolean;
            loading: boolean;
            loadMore: VoidFunction;
        }> = {};

        workflowStates.forEach(stage => {
            const col = columns[stage] || { leads: [], page: 1, loading: false, hasMore: false };
            result[stage] = {
                leads: col.leads,
                hasMore: col.hasMore,
                loading: col.loading,
                loadMore: () => {
                    if (!col.loading && col.hasMore) {
                        fetchColumn(stage, col.page + 1);
                    }
                }
            };
        });

        return result;
    }, [columns, workflowStates, fetchColumn]);

    const flatLeads = useMemo(
        () => Object.values(columns).reduce<Lead[]>((acc, col) => [...acc, ...col.leads], []),
        [columns]
    );

    const globalLoading = useMemo(
        () => Object.values(columns).some((col) => col.loading),
        [columns]
    );

    return {
        columnsData,
        data: flatLeads,
        loading: globalLoading,
        hasMore: false,
        loadMore: () => {},
        refetch
    };
}

