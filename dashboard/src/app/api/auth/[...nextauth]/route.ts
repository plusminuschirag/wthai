import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Pass the options to NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 