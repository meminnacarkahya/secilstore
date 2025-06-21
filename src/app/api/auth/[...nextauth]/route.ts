import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

type ExtendedUser = User & {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

type ExtendedSession = Session & {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

type ExtendedJWT = JWT & {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-Posta", type: "email", placeholder: "johnsondoe@nomail.com" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch("https://maestro-api-dev.secil.biz/Auth/Login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "YOUR_SECRET_TOKEN"
            },
            body: JSON.stringify({
              username: credentials.email,
              password: credentials.password,
            }),
          });
          const data = await res.json();
          if (data?.data?.accessToken) {
            return {
              id: credentials.email,
              email: credentials.email,
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              expiresIn: data.data.expiresIn,
            } as ExtendedUser;
          }
          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as ExtendedUser).accessToken;
        token.refreshToken = (user as ExtendedUser).refreshToken;
        token.expiresIn = (user as ExtendedUser).expiresIn;
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      (session as ExtendedSession).accessToken = (token as ExtendedJWT).accessToken;
      (session as ExtendedSession).refreshToken = (token as ExtendedJWT).refreshToken;
      (session as ExtendedSession).expiresIn = (token as ExtendedJWT).expiresIn;
      return session as ExtendedSession;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 