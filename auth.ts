import NextAuth, { type DefaultSession } from "next-auth"
import Google from 'next-auth/providers/google'
import connectToMongoose from '@/lib/mongoose'
import User from '@/app/_models/userModel'


declare module "next-auth" {
  interface Session {
    user : {
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
  callbacks: {
    async jwt({token, account, profile, user}) {
      try {
        await connectToMongoose()
        if (user) {
          if (!profile || !profile.email) {
            console.log('token', token)
            console.log('account', account)
            console.log('profile', profile)
            console.log('user', user)
            throw new Error('User does not have an email in profile')
          }
          const existingUser = await User.findOne({
            email:profile.email
          })

          if (!existingUser) {
            console.log('User does not exist')
            const newUser = await User.create({
              email: profile.email
            })

            console.log('NEW USER CREATED:', newUser)

            token.id = newUser._id
          } else {
            console.log('User already exists : ', existingUser)
            token.id = existingUser._id
            token.currencyAmt = existingUser.currencyAmt || 0
          }
        }

        return token
      } catch (err) {
        console.error(err)
        token.dbError = true
        return token
      }


    },
    async session({session, token}) {
      if (token.id) {
        session.user.id = token.id.toString()
        session.user.currencyAmt = token.currencyAmt as number
      
      }
      if (token?.dbError) {
        return {
          ...session,
          error: true,
          errorMessage: 'Database connection issue, please try relogging / try again later.'
        }
      }
      return session
    }
  }
})