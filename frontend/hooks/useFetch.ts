/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ApiResponse } from "@/types";

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
const [responseData, setResponse]=useState<any>(null);
  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction();
      setResponse(response)
      const result: ApiResponse<T> = response.data;
      if (result.success||response.success) {
        setData(result.data || null);
      } else {
        setError(result.error || "An error occurred");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
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
    response:responseData?.data,
    data,
    loading,
    error,
    refetch,
    execute,
  };
}
