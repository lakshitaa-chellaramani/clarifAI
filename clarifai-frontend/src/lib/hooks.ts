"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "./api";

// Generic hook for data fetching
function useAPI<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, error, loading, refetch: fetch };
}

// --- Specific Hooks ---

export function useTopics(refresh = false) {
  return useAPI(() => api.getTopics(refresh), [refresh]);
}

export function useTopicDetail(topicId: string) {
  return useAPI(() => api.getTopicDetail(topicId), [topicId]);
}

export function useSources() {
  return useAPI(() => api.getSources(), []);
}

export function useClaims(topic?: string, limit = 20) {
  return useAPI(() => api.getClaims(topic, limit), [topic, limit]);
}

export function useGraphNodes(topic?: string, limit = 50) {
  return useAPI(() => api.getGraphNodes(topic, limit), [topic, limit]);
}

export function useGraphStats() {
  return useAPI(() => api.getGraphStats(), []);
}

export function useSystemStats() {
  return useAPI(() => api.getSystemStats(), []);
}

// --- Mutation Hooks ---

export function useVerifyClaim() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const verify = useCallback(async (claim: string, topic?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.verifyClaim(claim, topic);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { verify, loading, error };
}

export function useGenerateScript() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [script, setScript] = useState<api.AnchorScript | null>(null);

  const generate = useCallback(
    async (topic: string, tone = "professional", duration = "short") => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.generateAnchorScript(topic, tone, duration);
        setScript(result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { generate, script, loading, error };
}

export function useAnalyzeTopics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.analyzeTopics();
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, loading, error };
}
