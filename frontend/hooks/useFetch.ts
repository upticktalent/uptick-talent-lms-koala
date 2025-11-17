'use client';

import { useState, useEffect } from 'react';
import { ApiResponse } from '@/types';

interface UseFetchOptions {
  immediate?: boolean;
}

export function useFetch<T = any>(
  fetchFunction: () => Promise<any>,
  options: UseFetchOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction();
      const result: ApiResponse<T> = response.data;
      
      if (result.success) {
        setData(result.data || null);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    execute();
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    execute,
  };
}
