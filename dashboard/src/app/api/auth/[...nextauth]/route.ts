import NextAuth, { type NextAuthOptions, type User as NextAuthUser, type Account, type Session, type DefaultSession } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

// Extend the built-in types
interface BackendUser {
  userId: string;
  name: string;
  email: string;
  picture?: string | null;
  createdAt: string;
  lastLoginAt: string;
  metrics: { [key: string]: number };
}

// Extend JWT to include our custom fields
interface ExtendedJWT extends JWT {
  id?: string;
  backendUser?: BackendUser | null; // Store the synced user data
}

// Extend Session to include our custom fields from the JWT
interface ExtendedSession {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    metrics?: { [key: string]: number } | null;
  };
  expires: string;
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID in environment variables.');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_SECRET in environment variables.');
}
if (!process.env.BACKEND_API_URL) {
  throw new Error('Missing BACKEND_API_URL in environment variables.');
}

const BACKEND_USER_API = `${process.env.BACKEND_API_URL}/user`;

// Helper function to sync user with backend
async function syncUserWithBackend(user: NextAuthUser): Promise<BackendUser | null> {
  if (!user.id || !user.email || !user.name) {
    console.error('[WTHAI:NextAuth:Sync] Missing required user info for backend sync:', user);
    return null;
  }

  console.log(`[WTHAI:NextAuth:Sync] Attempting to sync user: ${user.id}`);
  try {
    const response = await fetch(BACKEND_USER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id, // Google ID
        name: user.name,
        email: user.email,
        picture: user.image,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`[WTHAI:NextAuth:Sync] Backend sync failed for user ${user.id}: ${response.status} - ${responseData.error || responseData.message}`);
      return null; // Indicate sync failure
    }

    console.log(`[WTHAI:NextAuth:Sync] Backend sync successful for user ${user.id}`);
    return responseData.user as BackendUser; // Return the full user object from backend
  } catch (error) {
    console.error(`[WTHAI:NextAuth:Sync] Error during backend sync for user ${user.id}:`, error);
    return null;
  }
}

// Define the auth options object
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }: { user: NextAuthUser, account: Account | null }): Promise<boolean> {
      if (account?.provider === 'google' && user) {
        console.log(`[WTHAI:NextAuth:Callback:signIn] Google sign-in successful for user: ${user.id}`);
        const syncedUser = await syncUserWithBackend(user);
        if (!syncedUser) {
          console.error(`[WTHAI:NextAuth:Callback:signIn] Backend sync failed for user ${user.id}, blocking sign in.`);
          return false;
        }
        console.log(`[WTHAI:NextAuth:Callback:signIn] Backend sync successful for user ${user.id}. Allowing sign in.`);
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }: { token: JWT, user?: NextAuthUser, account?: Account | null }): Promise<JWT> {
      const extendedToken = token as ExtendedJWT;
      if (account && user) {
        console.log(`[WTHAI:NextAuth:Callback:jwt] Initial sign-in or token refresh for user: ${user.id}`);
        extendedToken.id = user.id;
        const backendUser = await syncUserWithBackend(user);
        extendedToken.backendUser = backendUser;
        if (!backendUser) {
           console.warn(`[WTHAI:NextAuth:Callback:jwt] Failed to get backend data for user ${user.id} during JWT creation.`);
        }
      }
      return extendedToken;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      const extendedToken = token as ExtendedJWT;
      if (!session.user) {
        session.user = {} as DefaultSession["user"];
      }
      const userWithMetrics = session.user as ExtendedSession["user"];
      if (extendedToken.backendUser) {
        userWithMetrics.id = extendedToken.backendUser.userId;
        userWithMetrics.name = extendedToken.backendUser.name;
        userWithMetrics.email = extendedToken.backendUser.email;
        userWithMetrics.image = extendedToken.backendUser.picture;
        userWithMetrics.metrics = extendedToken.backendUser.metrics;
      } else if (extendedToken.id) {
        userWithMetrics.id = extendedToken.id;
        console.warn(`[WTHAI:NextAuth:Callback:session] Using partial user data for session as backend sync failed for user ${extendedToken.id}`);
        userWithMetrics.metrics = null;
      }
      return session;
    },
    async redirect({ baseUrl }: { baseUrl: string }): Promise<string> {
      // Always redirect to dashboard after successful sign-in
      console.log(`[WTHAI:NextAuth:Callback:redirect] Forcing redirect to ${baseUrl}/dashboard`);
      return baseUrl + '/dashboard';
    },
  },
  pages: {
    // signIn: '/auth/signin',
    // error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Pass the options to NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 