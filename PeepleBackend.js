var endpoint = 'https://api.peeple.io/app/v1/'

function apiURL() {
    var result = endpoint

    for(var index=0; index<arguments.length; ++index) {
        result += arguments[index] + '/'
    }

    return result
}

function makeBackendRequest(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000

    xhr.open('GET', url);
    xhr.setRequestHeader('Access-Control-Allow-Origin', window.location.origin)
    xhr.setRequestHeader('X-Peeple', PeepleBackend.getAPIKey())

    xhr.onreadystatechange = function onreadystatechange() {
        if (xhr.readyState === 4) {
            var response = {
                success: xhr.status == 200,
                status: xhr.status,
                responseText: xhr.responseText
            }

            try {
                response.json = JSON.parse(xhr.responseText)
            } catch(e) {
                console.error(e)
            }

            console.log(response)

            if (callback) {
                callback(response)
            }
        }
    }

    console.log(url)
    xhr.send();
}

var PeepleBackend = function() {
    return {
        getAuthHeaders: function() {
            return {'X-Peeple':PeepleLogin.getAPIKey()}
        },

        getDevicesEndpoint: function(page) {
            return apiURL('devices', page)
        },

        getKnocksEndpoint: function(startTime) {
            return apiURL('knocks', startTime)
        } ,           
    }
}

window.PeepleBackend = PeepleBackend()