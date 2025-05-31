
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [GitHub],
    session: {
        strategy: "jwt", // Use JWT instead of database sessions
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Persist user data in the token
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.image = user.image
            }
            return token
        },
        async session({ session, token }) {
            // Add user data from token to session
            if (token) {
                session.user.id = token.id
                session.user.email = token.email
                session.user.name = token.name
                session.user.image = token.image
            }
            return session
        },
        async signIn({ user, account, profile }) {
            // Allow all sign-ins for now
            return true
        }
    }
})