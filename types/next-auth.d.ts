import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      walletAddress: string;
    } & DefaultSession['user'];
  }

  interface User {
    walletAddress: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    walletAddress: string;
  }
}
