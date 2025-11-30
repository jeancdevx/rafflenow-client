import { Amplify } from 'aws-amplify'
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito'
import { CookieStorage } from 'aws-amplify/utils'
import { env } from './env'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: env.cognito.userPoolId,
      userPoolClientId: env.cognito.clientId,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true
      },
      userAttributes: {
        email: { required: true },
        given_name: { required: true },
        family_name: { required: true }
      }
    }
  }
})

const isSecure =
  typeof window !== 'undefined' && window.location.protocol === 'https:'
const domain =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost'

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    domain,
    secure: isSecure,
    sameSite: 'lax',
    expires: 1,
    path: '/'
  })
)

export default Amplify
