import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma.db';

import type { Session, User, Account } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { AuthOptions } from 'next-auth';

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          username: user.email.split('@')[0],
          role: user.role,
        };
      }
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user: User | null; account: Account | null }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
      }
      if (account?.provider === 'github') {
        token.username = user?.name || user?.email?.split('@')[0];
        token.role = 'user';
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    }
  },

  session: {
    strategy: "jwt"
  },

  pages: {
    signIn: '/sign-in'
  },

  secret: process.env.NEXTAUTH_SECRET
};

export default authOptions;
