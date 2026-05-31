import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertProfile } from "./insforge";

export const authConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.providerAccountId) {
        await upsertProfile({
          id: account.providerAccountId,
          email: user?.email,
          name: user?.name,
          image: user?.image,
        });
      }
      return true;
    },
  },
};

const nextAuth = NextAuth(authConfig);

export const { handlers, auth, signIn, signOut } = nextAuth;
