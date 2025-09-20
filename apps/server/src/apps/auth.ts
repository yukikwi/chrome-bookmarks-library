import { Elysia } from "elysia";
import { auth } from "../lib/auth";

export const authApp = new Elysia({ name: "auth" })
.mount(auth.handler)
.macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });
      if (!session) return status(401);
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
})
.all("/api/auth/*", async (context) => {
  const { request } = context;
  if (["POST", "GET"].includes(request.method)) {
    return auth.handler(request);
  }
  return context.status(405)
});