import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  // Don't use PrismaAdapter with CredentialsProvider - they conflict
  // adapter: PrismaAdapter(prisma) as any, // ❌ Remove this
  
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { profile: true }, // Include profile for future use
        })

        // Changed from user.password to user.passwordHash to match schema
        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash // ✅ Matches schema field
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.profile?.name, // Optional: include name from profile
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt', // ✅ Required when using CredentialsProvider
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role
        session.user.id = token.id as string
      }
      return session
    },
  },
  
  pages: {
    signIn: '/login',
    // Optional: add more custom pages
    // signUp: '/register',
    // error: '/auth/error',
  },
}

// TypeScript module augmentation
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: Role
      name?: string | null
    }
  }

  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    id: string
  }
}