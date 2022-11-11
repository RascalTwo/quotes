import { useRef, useState, useCallback } from "react";
import { MediaQuotesClient, CancelError } from "./openapi";

import type { CancelablePromise } from "./openapi";

export const useOpenAPIService = () => {
  const client = useRef(
    new MediaQuotesClient({
      BASE: window.location.origin + '/api',
    }),
  ).current;
  const [loading, setLoading] = useState(true);
  const [error, setErrorValue] = useState<any | null>(null);
  const setError = useCallback(
    (error: any) => {
      if (error instanceof CancelError) return;

      if (error !== null) console.error(error);
      setErrorValue(error);
    },
    [setErrorValue],
  );

  const makeRequest = useCallback(
    <T extends any>(request: CancelablePromise<T>, onFulfilled: (value: T) => any) => {
      let mounted = true;
      setLoading(true);

      request
        .then(value => {
          if (!mounted) return;
          return Promise.resolve(onFulfilled(value)).then(() => setError(null));
        })
        .catch(setError)
        .finally(() => setLoading(false));

      return () => {
        mounted = false;
        request.cancel();
      };
    },
    [setLoading, setError],
  );

  return {
    service: client.default,
    loading,
    error,
    setError,
    makeRequest,
  };
}

export const useSearchState = (
  initialState: string,
  key: string,
  excludeIf?: (value: string) => boolean,
): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const [state, setStateValue] = useState(
    useCallback(() => new URLSearchParams(window.location.search).get(key) ?? initialState, [key]),
  );
  const setState: React.Dispatch<React.SetStateAction<string>> = useCallback(
    (action: React.SetStateAction<string>) => {
      const value = typeof action === 'function' ? action(state) : action;

      const params = new URLSearchParams(window.location.search);
      if (value === '' || excludeIf?.(value)) params.delete(key);
      else params.set(key, value);

      const suffix = params.toString() ? `?${params.toString()}` : '';
      window.history.replaceState({}, '', `${window.location.pathname}${suffix}`);

      setStateValue(value);
    },
    [key, state, setStateValue],
  );
  return [state, setState];
};