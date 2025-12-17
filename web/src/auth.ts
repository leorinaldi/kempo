import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false
  // Use ALLOWED_EMAILS if set, otherwise fall back to ADMIN_EMAILS
  const allowedEmails = (process.env.ALLOWED_EMAILS || process.env.ADMIN_EMAILS)
    ?.split(',')
    .map(e => e.trim().toLowerCase()) || []
  return allowedEmails.includes(email.toLowerCase())
}

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
  return adminEmails.includes(email.toLowerCase())
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    signIn: async ({ user }) => {
      // Only allow users on the allowed list to sign in
      if (!isAllowedEmail(user.email)) {
        return false
      }
      return true
    },
    authorized: async ({ auth }) => {
      return !!auth
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.isAdmin = isAdminEmail(user.email)
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
})
