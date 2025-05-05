/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

// No longer using auth from removed module
// Define user role here instead
export enum UserRole {
  user = "user",
  admin = "admin",
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
interface CreateContextOptions {
  session: null; // No session now
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  // No session - removed auth
  const session = null;

  return {
    session,
    headers: opts.headers,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * This has been simplified since we removed auth.
 * In a real app, this would verify the session is valid.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // For demo purposes, we're allowing all requests
  // In production, this would check authentication
  
  return next({
    ctx: {
      // Pass an empty session object
      session: { user: { id: 'demo-user', role: UserRole.admin } },
    },
  });
});

// /**
//  * Protected (authenticated) procedure
//  *
//  * If you want a query or mutation to ONLY be accessible to logged in admins, use this. It verifies
//  * the session is valid and guarantees `ctx.session.user` has admin privileges.
//  *
//  * @see https://trpc.io/docs/procedures
//  */
// export const adminProcedure = t.procedure.use(({ ctx, next }) => {
//   if (!ctx.session?.user?.isAdmin) {
//     throw new TRPCError({
//       code: "UNAUTHORIZED",
//       message: "Admin privileges required",
//     });
//   }

//   return next({
//     ctx: {
//       session: { ...ctx.session, user: ctx.session.user },
//     },
//   });
// });
