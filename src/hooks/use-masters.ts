import { useState, useEffect, useCallback } from 'react';

import { fetchDepartments, fetchProjects, fetchActivityTypes, fetchBankAccounts, fetchClaimTypes, fetchAssetCategories, fetchEvaluationTraitCategories, fetchDesignations } from 'src/api/masters';

export function useDepartments(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  orderBy: string = 'creation',
  order: 'asc' | 'desc' = 'desc',
  status: string = 'all'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any[] = [];
      if (status !== 'all') {
        filters.push(['Department', 'status', '=', status]);
      }

      const result = await fetchDepartments({
        page,
        page_size: pageSize,
        search,
        orderBy,
        order,
        filters
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch departments:', err);
      setError(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderBy, order, status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
}

export function useProjects(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  orderBy: string = 'creation',
  order: 'asc' | 'desc' = 'desc',
  status: string = 'all'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any[] = [];
      if (status !== 'all') {
        filters.push(['Project', 'status', '=', status]);
      }

      const result = await fetchProjects({
        page,
        page_size: pageSize,
        search,
        orderBy,
        order,
        filters
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderBy, order, status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
}

export function useActivityTypes(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  orderBy: string = 'creation',
  order: 'asc' | 'desc' = 'desc'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchActivityTypes({
        page,
        page_size: pageSize,
        search,
        orderBy,
        order
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch activity types:', err);
      setError(err.message || 'Failed to fetch activity types');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderBy, order]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
}

export function useBankAccounts(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  orderBy: string = 'creation',
  order: 'asc' | 'desc' = 'desc'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBankAccounts({
        page,
        page_size: pageSize,
        search,
        orderBy,
        order
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch bank accounts:', err);
      setError(err.message || 'Failed to fetch bank accounts');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderBy, order]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
}

export function useClaimTypes(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  orderBy: string = 'creation',
  order: 'asc' | 'desc' = 'desc'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchClaimTypes({
        page,
        page_size: pageSize,
        search,
        orderBy,
        order
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch claim types:', err);
      setError(err.message || 'Failed to fetch claim types');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderBy, order]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
}

export function useAssetCategories(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  orderBy: string = 'creation',
  order: 'asc' | 'desc' = 'desc'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAssetCategories({
        page,
        page_size: pageSize,
        search,
        orderBy,
        order
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch asset categories:', err);
      setError(err.message || 'Failed to fetch asset categories');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderBy, order]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
}

export function useEvaluationTraitCategories(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  orderBy: string = 'creation',
  order: 'asc' | 'desc' = 'desc'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEvaluationTraitCategories({
        page,
        page_size: pageSize,
        search,
        orderBy,
        order
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch evaluation trait categories:', err);
      setError(err.message || 'Failed to fetch evaluation trait categories');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderBy, order]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
}

export function useDesignations(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  orderBy: string = 'creation',
  order: 'asc' | 'desc' = 'desc'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDesignations({
        page,
        page_size: pageSize,
        search,
        orderBy,
        order
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch designations:', err);
      setError(err.message || 'Failed to fetch designations');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, orderBy, order]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
}
