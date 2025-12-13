"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { cohortService } from "@/services/cohortService";
import { ICohort, ApiResponse } from "@/types";
import { toast } from "sonner";

interface CohortContextType {
  currentCohort: ICohort | null;
  loading: boolean;
  error: string | null;
  refreshCohort: () => Promise<void>;
  setCohort: (cohort: ICohort | null) => void;
}

const CohortContext = createContext<CohortContextType | undefined>(undefined);

interface CohortProviderProps {
  children: ReactNode;
}

export function CohortProvider({ children }: CohortProviderProps) {
  const [currentCohort, setCurrentCohort] = useState<ICohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentCohort = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<ICohort> =
        await cohortService.getCurrentActiveCohort();

      if (response.success && response.data) {
        setCurrentCohort(response.data);
        console.log("Active cohort loaded:", response.data.name);
      } else {
        setCurrentCohort(null);
        setError(response.message || "No active cohort found");
        console.warn("No active cohort found");
      }
    } catch (error: any) {
      setCurrentCohort(null);
      setError(error.message || "Failed to load active cohort");
      console.error("Error fetching active cohort:", error);
      toast.error("Failed to load active cohort");
    } finally {
      setLoading(false);
    }
  };

  const refreshCohort = async () => {
    await fetchCurrentCohort();
  };

  const setCohort = (cohort: ICohort | null) => {
    setCurrentCohort(cohort);
  };

  useEffect(() => {
    fetchCurrentCohort();
  }, []);

  const contextValue: CohortContextType = {
    currentCohort,
    loading,
    error,
    refreshCohort,
    setCohort,
  };

  return (
    <CohortContext.Provider value={contextValue}>
      {children}
    </CohortContext.Provider>
  );
}

export function useCohortContext(): CohortContextType {
  const context = useContext(CohortContext);
  if (context === undefined) {
    throw new Error("useCohortContext must be used within a CohortProvider");
  }
  return context;
}

// Helper hook to get cohort ID directly
export function useCohortId(): string | null {
  const { currentCohort } = useCohortContext();
  return currentCohort?._id || null;
}

// Helper hook to check if cohort is available
export function useHasCohort(): boolean {
  const { currentCohort, loading } = useCohortContext();
  return !loading && currentCohort !== null;
}

// Re-export cohort-aware services hook
export { useCohortAwareServices } from "@/services/cohortAwareServices";
