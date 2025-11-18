/**
 * This file holds a copy of the useAsyncFn hook from react-use, as well as it's dependencies. This
 * was just because we wanted a behaviour similar to this one hook, but not all the other hooks
 * that are packaged with it.
 *
 * Reference: https://github.com/streamich/react-use
 * Copied from version v17.6.0
 */

/* eslint-disable */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';

export type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;

export type FunctionReturningPromise = (...args: any[]) => Promise<any>;

function useMountedState(): () => boolean {
  const mountedRef = useRef<boolean>(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}

export type AsyncState<T>
  = | {
    loading: boolean,
    error?: undefined,
    value?: undefined,
  }
  | {
    loading: true,
    error?: Error | undefined,
    value?: T,
  }
  | {
    loading: false,
    error: Error,
    value?: undefined,
  }
  | {
    loading: false,
    error?: undefined,
    value: T,
  };

type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> = AsyncState<
  PromiseType<ReturnType<T>>
>;

export type AsyncFnReturn<T extends FunctionReturningPromise = FunctionReturningPromise> = [
  StateFromFunctionReturningPromise<T>,
  T,
];

export default function useAsyncFn<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = [],
  initialState: StateFromFunctionReturningPromise<T> = { loading: false },
): AsyncFnReturn<T> {
  const lastCallId = useRef(0);
  const isMounted = useMountedState();
  const [state, set] = useState<StateFromFunctionReturningPromise<T>>(initialState);

  const callback = useCallback((...args: Parameters<T>): ReturnType<T> => {
    const callId = ++lastCallId.current;

    if (!state.loading) {
      set((prevState) => ({ ...prevState, loading: true }));
    }

    return fn(...args).then(
      (value) => {
        isMounted() && callId === lastCallId.current && set({ value, loading: false });

        return value;
      },
      (error) => {
        isMounted() && callId === lastCallId.current && set({ error, loading: false });

        return error;
      },
    ) as ReturnType<T>;
  }, deps);

  return [state, callback as unknown as T];
}
