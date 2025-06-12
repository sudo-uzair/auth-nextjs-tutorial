import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      username?: string;
      role?: string;
    }
  }
  
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    username?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    role?: string;
  }
}