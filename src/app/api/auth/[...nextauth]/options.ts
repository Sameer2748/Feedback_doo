import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User'; // Assuming User is the Mongoose model
import { User as NextAuthUser } from 'next-auth';

// Define a type for your Mongoose User model
interface MongooseUser {
  _id: string; // Mongoose ID, which can be converted to string
  email: string;
  username?: string; // Optional if it may not always be present
  isVerified: boolean;
  isAcceptingMessages?: boolean; // Optional if it may not always be present
  password: string; // Ensure you have this if you're comparing passwords
}

// Define a type for credentials
interface Credentials {
  identifier: string;
  password: string;
}

// Map the Mongoose User to NextAuth User
function mapToNextAuthUser(user: MongooseUser): NextAuthUser {
  return {
    id: user._id, // Convert to string if necessary
    name: user.username,
    email: user.email,
    // Add any other fields you want to pass to NextAuth
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      // Correct types for `authorize`
      async authorize(credentials: Credentials | undefined): Promise<NextAuthUser | null> {
        if (!credentials) {
          return null;
        }

        await dbConnect();

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error('No user found with this email or username');
          }

          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordCorrect) {
            throw new Error('Incorrect password');
          }

          // Return the mapped user
          return mapToNextAuthUser(user);
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error('An unknown error occurred');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Make sure _id is string, and attach other fields to the token
        token._id = user.id; // Use user.id as per mapped type
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.name ?? undefined; // This will assign `undefined` if `user.name` is null or undefined
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Attach the token information to the session user object
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/signIn',
  },
};
