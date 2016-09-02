var authTokenKey = 'authToken'
var userProfileKey = 'userProfile'

var options = {
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

var lock = new Auth0Lock('k5VBEVilgZWMc4RNFiSFrlUY9NBp54cf', 'peeple.auth0.com', options)

var loginState = JSON.parse(localStorage.getItem('loginState')) || {}
var activeStateName = "LoggedOut"

function onLoginStateChanged() {
  if(loginState) {
    localStorage.setItem('loginState', JSON.stringify(loginState))
  } else {
    localStorage.removeItem('loginState')
  }

  var newState = "LoggedOut"

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

function PeepleLogin() {
  return {
    logout: function() {
      logout()
    },

    login: function() {
      updateProfile()
    },

    getLoginState: function() {
      return activeStateName
    },

    getAuthToken: function() {
      return loginState.token
    },

    getAPIKey: function() {
      return loginState.appAPIKey
    },
  }
}

window.PeepleLogin = PeepleLogin()