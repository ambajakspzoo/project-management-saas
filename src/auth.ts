import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const demoEmail =
          process.env.AUTH_DEMO_EMAIL ?? process.env.NEXTAUTH_DEMO_EMAIL;
        const demoPassword =
          process.env.AUTH_DEMO_PASSWORD ??
          process.env.NEXTAUTH_DEMO_PASSWORD;

        if (!email || !password || !demoEmail || !demoPassword) {
          return null;
        }

        if (email === demoEmail && password === demoPassword) {
          return {
            id: "demo-user",
            name: "Demo User",
            email: demoEmail,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
