import { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from '@/model/User'; // Adjust import based on your User model definition

// Define the credentials type
interface Credentials {
  identifier: string; // email or username
  password: string;
}

// Extend the DefaultSession to include custom user properties
declare module 'next-auth' {
  interface Session {
    user: {
      _id: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
      username: string;
      name?: string | null; // Include other properties if necessary
      email?: string | null; // Include other properties if necessary
      image?: string | null; // Include other properties if necessary
    } & DefaultSession['user']; // Merge with the default user properties
  }
}

// Define the NextAuthOptions
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials): Promise<User | null> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error('No user found with this email');
          }
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user; // Returning the user object
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : 'An error occurred');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string; // Type assertion
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
        session.user.username = token.username as string;
      }
      return session; // No need to cast to ExtendedSession here
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXT_AUTH_SECRET,
  pages: {
    signIn: '/signIn',
  },
};
