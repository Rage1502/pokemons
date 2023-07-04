import * as trpcNext from "@trpc/server/adapters/next";
import { type AppRouter, appRouter } from "../../../server/routers/_app";
import { type inferRouterOutputs } from "@trpc/server";
// export API handler
// @see https://trpc.io/docs/server/adapters
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});

export type RouterOutput = inferRouterOutputs<AppRouter>;
