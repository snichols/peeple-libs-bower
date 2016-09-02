//
// API for talking to the Peeple backend.
//
let endpoint = 'https://api.peeple.io/app/v1/'

function apiURL() {
	let result = endpoint

	for(var index=0; index<arguments.length; ++index) {
		result += arguments[index] + '/'
	}

	return result
}

function makeBackendRequest(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.timeout = 10000

    xhr.open('GET', url);
	xhr.setRequestHeader('Access-Control-Allow-Origin', window.location.origin)
	xhr.setRequestHeader('X-Peeple', PeepleBackend.getAPIKey())

    xhr.onreadystatechange = function onreadystatechange() {
        if (xhr.readyState === 4) {
        	let response = {
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


class PeepleBackend
{
	getAuthHeaders() {
		return {'X-Peeple':PeepleLogin.getAPIKey()}
	}

	getDevicesEndpoint(page) {
		return apiURL('devices', page)
	}

    getKnocksEndpoint(startTime) {
        return apiURL('knocks', startTime)
    }
}

window.PeepleBackend = new PeepleBackend()