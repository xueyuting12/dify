import { fetchAccessToken } from '@/service/share'
export const checkOrSetAccessToken = async () => {
  const sharedToken = globalThis.location.pathname.split('/').slice(-1)[0]
  const accessToken = localStorage.getItem('token') || JSON.stringify({ [sharedToken]: '' })
  const webSSOToken = localStorage.getItem('web_sso_token') || ''
  let accessTokenJson = { [sharedToken]: '' }
  try {
    accessTokenJson = JSON.parse(accessToken)
  }
  catch (e) {

  }
  if (!accessTokenJson[sharedToken]) {
    try {
      const res = await fetchAccessToken(sharedToken, webSSOToken)
      accessTokenJson[sharedToken] = res.access_token
      localStorage.setItem('token', JSON.stringify(accessTokenJson))
    }
    catch (e) {
      localStorage.removeItem('web_sso_token')
    }
  }
}
