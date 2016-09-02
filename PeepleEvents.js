function PeepleEvents() {
	return {
		_observers: [],

		addObserver: function(who) {
			var index = this._observers.indexOf(null)

			if(index !== -1) {
				this._observers[index] = who
			} else {			
				this._observers.push(who)
			}
		},

		removeObserver: function(who) {
			var index = this._observers.indexOf(who)

			if(index !== -1) {
				this._observers[index] = null
			}
		},

		sendEvent: function(name, args) {
			//console.log('sendEvent:', name, args)
			
			for(var index=0; index<this._observers.length; ++index) {
				var who = this._observers[index]

				if(who === null)
					continue

				var handler = who[name]

				if(handler) {
					handler.call(who, args)
				}
			}
		},
	}
}

window.PeepleEvents = PeepleEvents()