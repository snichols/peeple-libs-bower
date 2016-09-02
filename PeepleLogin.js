//
// This module forces the user to login and manages login state.
//
let authTokenKey = 'authToken'
let userProfileKey = 'userProfile'

let options = {
  closable: false,
  autoclose: true,
  theme: {
    primaryColor: "#e56840",
    logo: "/images/Auth0Logo.png"
  },
  languageDictionary: {
    title: "Login to use Peeple"
  }
}

let lock = new Auth0Lock('k5VBEVilgZWMc4RNFiSFrlUY9NBp54cf', 'peeple.auth0.com', options)

let loginState = JSON.parse(localStorage.getItem('loginState')) || {}
let activeStateName = "LoggedOut"

function onLoginStateChanged() {
  if(loginState) {
    localStorage.setItem('loginState', JSON.stringify(loginState))
  } else {
    localStorage.removeItem('loginState')
  }

  let newState = "LoggedOut"

  if(loginState && loginState.token && loginState.profile && loginState.appAPIKey) {
    newState = "LoggedIn"
  }

  if(newState !== activeStateName) {
    activeStateName = newState
    PeepleEvents.sendEvent('onPeepleLoginStateChange', activeStateName)  
  }
}

function clearLoginState() {
  loginState = null
  onLoginStateChanged()
}

function logout() {
  clearLoginState()
  window.location.href = 'https://peeple.auth0.com/v2/logout?returnTo=' + window.location.origin
}

function updateProfile() {
  if(loginState && loginState.token) {
    lock.getProfile(loginState.token, function(error, profile) {
      if(error) {
        console.error(error)
        logout()
      } else {
        if(loginState.profile !== profile) {
          loginState.profile = profile
          onLoginStateChanged()
        }

        makeServerRequest('https://api.peeple.io/token/v1/exchange/'+loginState.token, function(result) {
          loginState.appAPIKey = result.json.key
          onLoginStateChanged()
        })
      }
    })        
  } else {
    lock.show()
  }
}

lock.on('authenticated', function(authResult) {
  loginState = {token: authResult.idToken}
  onLoginStateChanged()
  updateProfile()
})

//
// Expose a global object that components can access.
//
class PeepleLogin
{
  constructor() {

  }

  logout() {
    logout()
  }

  login() {
    updateProfile()
  }

  getLoginState() {
    return activeStateName
  }

  getAuthToken() {
    return loginState.token
  }

  getAPIKey() {
    return loginState.appAPIKey
  }
}

window.PeepleLogin = new PeepleLogin()
