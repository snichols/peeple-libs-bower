function defaultDeviceState() {
	return {
		name: "My Peeple",
		deviceID: null,
		networkName: null,
		ipAddress: null,
		handOffKey: null,
		batteryLevel: null,
		accountID: null,
		stale: true,
		waitingOnSettings: false,
		statusText: 'Setting things up.',
	}
}

var desiredSettings = {}

var deviceState = defaultDeviceState()
var lastSuccessfulPingTime = 0

function checkForStaleDevice() {
	var wasStateStale = deviceState.stale

	var now = Date.now()
	var timeSinceLastPing = now - lastSuccessfulPingTime	
	deviceState.stale = timeSinceLastPing > 10000

	if(wasStateStale != deviceState.stale) {
		if(wasStateStale) {
			app.displayToast('Connected to ' + deviceState.name)
		} else {
			app.displayToast('Disconnected from ' + deviceState.name)
		}

		PeepleEvents.sendEvent('onPeepleDeviceChanged', deviceState)
	}
}

setInterval(checkForStaleDevice, 500)

function setStatusText(text) {
	deviceState.statusText = text
	PeepleEvents.sendEvent('onPeepleDeviceChanged', deviceState)
}

var deviceStateURL = 'http://192.168.4.1/wifi/status'
var createHandOffKeyURL = 'http://192.168.4.1/config/createHandOffKey'
var resetWifiURL = 'http://192.168.4.1/wifi/reset?delay=30000'

function updateDeviceState() {
	makeServerRequest(deviceStateURL, function(response) {
		if(response.status === 200 && response.json)
		{
			var data = response.json

			deviceState.deviceID = data.deviceID

			if(data.ssid && data.ssid !== "") {
				deviceState.networkName = data.ssid
			}

			if(data.ip && data.ip !== "0.0.0.0") {
				deviceState.ipAddress = data.ip
			} else {
				deviceState.ipAddress = null
			}

			if(data.voltage && data.voltage > 0) {
				var voltage = data.voltage / 0xffff
				deviceState.batteryLevel = ((voltage / 4.57)*100)|0
			}

			deviceState.fullframe = data.fullframe
			deviceState.compression = data.compression
			deviceState.xshift = data.xshift
			deviceState.yshift = data.yshift

			deviceState.waitingOnSettings = false

			for(var key in desiredSettings) {
				var desiredValue = desiredSettings[key]

				if(deviceState[key] != desiredValue) {
					deviceState.waitingOnSettings = true
					break
				}
			}

			lastSuccessfulPingTime = Date.now()
			PeepleEvents.sendEvent('onPeepleDeviceChanged', deviceState)
		}

		setTimeout(updateDeviceState, 500)
	})
}

function doAssociateWithAccount() {
	setStatusText('Registering device.')

	makeServerRequestWithRetry(createHandOffKeyURL, function(response) {
		if(response.success) {
			deviceState.handOffKey = response.json.key
			PeepleEvents.sendEvent('onPeepleDeviceChanged', deviceState)

			var appHandOffURL = 'https://my.peeple.io/#!/handoff/' + deviceState.deviceID + '.' + response.json.key
			setStatusText('Disconnecting from Peeple.')

			makeServerRequestWithRetry(resetWifiURL, function(response) {
				setStatusText('Waiting for Internet connection.')

				function checkForAPI() {
					makeServerRequest('https://api.peeple.io/app/v1/time', function(response) {
						if(response.status === 401) {
							window.location = appHandOffURL
						} else {
							setTimeout(checkForAPI, 250)
						}
					})
				}

				checkForAPI()
			})
		} else {
			setStatusText('Error.  Please reload page.')
		}
	})
}

function PeepleDevice() {
	return {
		getDeviceState: function() {
			return deviceState
		},

		associateWithAccount: function() {
			doAssociateWithAccount()
		},

		updateDesiredSettings: function(settings) {
			var url = "http://192.168.4.1/camera/settings?"

    		for(var key in settings) {
    			desiredSettings[key] = settings[key]
    			url += key
    			url += "="
    			url += settings[key]
    			url += "&"
    		}

    		makeServerRequest(url, function() {
    		})

    		deviceState.waitingOnSettings = true
			PeepleEvents.sendEvent('onPeepleDeviceChanged', deviceState)
		}
	}
}

window.PeepleDevice = PeepleDevice()

// start updating device state and never stop
updateDeviceState()	