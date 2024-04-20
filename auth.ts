import { JWT } from '@auth/core/jwt';
import NextAuth, { AuthError } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import authconfig from './auth.config';
import clientPromise from './lib/mongodb';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { LoginSchema } from './lib/schemas';
import { getUserByEmail } from './data/User';
import bcrypt from 'bcryptjs';
import { getSession } from 'next-auth/react';

//import session

export const AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
};

import { type DefaultSession, User } from 'next-auth';
import { redirect } from 'next/navigation';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      address: string;
      // By default, TypeScript merges new interface properties and overwrite existing ones. In this case, the default session user properties will be overwritten, with the new one defined above. To keep the default session user properties, you need to add them back into the newly declared interface
    } & DefaultSession['user']; // To keep the default types
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: 'ADMIN' | 'USER';
    address: string;
  }

  interface AdapterUser extends User {
    id: string;
    email: string | null;
    emailVerified: Date | null;
    role: 'ADMIN' | 'USER';
    address: string;
  }
}

declare module '@auth/core/adapters' {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: 'ADMIN' | 'USER';
    address: string;
  }

  interface AdapterUser extends User {
    id: string;
    email: string;
    emailVerified: Date | null;
    role: 'ADMIN' | 'USER';
    address: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },

  ...authconfig,

  providers: [
    ...authconfig.providers,
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);

          if (!user || !password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            console.log('USER: ', user);
            return {
              id: user._id,
              ...user,
              address: 'blabla',
              role: user.role || 'USER',
            };
          }
          return null;
        }
      },
    }),
  ],
  events: {
    async signIn({ user, profile, account }) {
      console.log('SIGN IN EVENT: ', { user, profile, account });
    },
    async updateUser({ user }) {
      console.log('UPDATE USER: ', { user });
    },
    async linkAccount({ user, profile, account }) {
      console.log('FROM LINK ACCOUNT: ', { user, profile, account });
      if (AuthOptions.adapter.updateUser && profile && user.id) {
        //
        //AuthOptions.adapter.linkAccount()
        await AuthOptions.adapter.updateUser({
          emailVerified: new Date(),
          role: 'USER',
          id: user.id,
          image: user.image || profile.image || null,
        });
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email }) {
      try {
        const currentSession = await getSession();
        if (currentSession) {
          console.log({ currentSession });
        }
      } catch (error) {
        console.log('ERROR OCCURED IN GETSESSION(): ', { error });
      }

      const k = await auth();
      console.log({ k });
      if (k) {
        return '/profile?error=OAuthAccountNotLinked';
      }
      //throw new AuthError('OAuthAccountNotLinked');
      console.log({ user, account, profile });

      return true;
    },
    async session({ token, session, user }) {
      console.log({ sessionToken: token, session, user });
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.address) {
        session.user.address = token.address as string;
      }
      if (token.role) {
        session.user.role = token.role as 'USER' | 'ADMIN';
      } else {
        session.user.role = 'USER';
      }
      //token.xxxxx = 'lalal';
      console.log({ modified: session });
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('jwt');
      console.log({ token, user, account });

      if (user && user.role && user.address) {
        console.log('USER ROLE: ', user.role);
        token.role = user.role;
        token.address = user.address;
      }

      console.log({ modifiedToken: token });

      return token;
    },
  },
});
