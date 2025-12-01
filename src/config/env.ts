export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  cdnUrl: import.meta.env.VITE_CDN_URL as string,
  cognito: {
    region: import.meta.env.VITE_COGNITO_REGION as string,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string
  }
} as const

const requiredVars = [
  'VITE_API_URL',
  'VITE_CDN_URL',
  'VITE_COGNITO_REGION',
  'VITE_COGNITO_USER_POOL_ID',
  'VITE_COGNITO_CLIENT_ID'
] as const

for (const varName of requiredVars) {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
}
