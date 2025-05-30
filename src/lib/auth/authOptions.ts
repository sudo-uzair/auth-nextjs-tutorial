import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import type { Session, User, Account} from 'next-auth';
import type { JWT } from 'next-auth/jwt';

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
       id: "Credentials", // Unique ID for this provider
      name: "Credentials", // Display name for the provider
      // Define the fields required for login
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        alert(credentials);
        console.log("credentials__ ", credentials);
        
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
       return null
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
        // token._id = user._id;
        token.email = user.email;
        token.username = user.username;
      }
      if (account?.provider === 'github') {
        // Handle GitHub user data
        token.username = user?.name || user?.email?.split('@')[0];
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        // session.user._id = token._id;
        session.user.email = token.email;
        session.user.username = token.username;
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