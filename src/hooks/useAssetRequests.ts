import { useState, useEffect, useCallback } from 'react';

import { fetchMyAssetRequests, fetchPendingAssetRequests } from 'src/api/asset-requests';

export function useMyAssetRequests(
  employeeId: string,
  page: number = 1,
  limit: number = 10,
  requestType: string = 'all',
  status: string = 'all',
  sortBy: string = 'creation desc'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const result = await fetchMyAssetRequests(
        employeeId,
        page,
        limit,
        requestType,
        status,
        sortBy
      );
      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch my asset requests:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId, page, limit, requestType, status, sortBy]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, refetch };
}

export function usePendingAssetRequests(
  page: number = 1,
  limit: number = 10,
  requestType: string = 'all',
  status: string = 'all',
  sortBy: string = 'creation desc'
) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPendingAssetRequests(page, limit, requestType, status, sortBy);
      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch pending asset requests:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, requestType, status, sortBy]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, refetch };
}
