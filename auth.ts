import NextAuth, { type DefaultSession } from "next-auth"
import Google from 'next-auth/providers/google'


declare module "next-auth" {
  interface Session {
    user: {
      currencyAmt: number
    } & DefaultSession['user'];

    expires: string;
    error?: string,
    errorMessage?: string

  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          prompt: 'select_account'
        }
      }
    })
  ],
  cookies: {
    sessionToken: {
      name: 'mmtl-session-token'
    }
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      try {
        if (user) {
          if (!profile || !profile.email) {
            console.log('token', token)
            console.log('account', account)
            console.log('profile', profile)
            console.log('user', user)
            throw new Error('User does not have an email in profile')
          }
          const encodedEmail = encodeURIComponent(profile.email)
          let baseFetchUrl
          if (process.env.NODE_ENV === 'development') {
            baseFetchUrl = 'http://localhost:3000'
          } else if (process.env.NODE_ENV === 'production') {
            baseFetchUrl = ''
          }
          const response = await fetch(`${baseFetchUrl}/api/user/get?email=${encodedEmail}`)

          if (response.ok) {
            const data = await response.json()
            console.log('[JWT CB] userId:', data.userId)
            token.id = data.userId

          }
        }

        return token
      } catch (err) {
        console.error(err)
        token.dbError = true
        return token
      }


    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id.toString()

      }
      if (token?.dbError) {
        return {
          ...session,
          error: true,
          errorMessage: 'Encountered an error connecting to our database.'
        }
      }
      return session
    }
  }
})