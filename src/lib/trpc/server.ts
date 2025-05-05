import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { createCaller } from "@/lib/api/root";
import { createTRPCContext } from "@/lib/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

export const api = {
  async query(path: string[], ...args: unknown[]) {
    const caller = createCaller(await createContext());
    return (caller as any)[path[0]]?.[path[1]]?.(...args);
  },
};
