class PeepleEvents
{
	constructor() {
		this._observers = []
	}

	addObserver(who) {
		let index = this._observers.indexOf(null)

		if(index !== -1) {
			this._observers[index] = who
		} else {			
			this._observers.push(who)
		}
	}

	removeObserver(who) {
		let index = this._observers.indexOf(who)

		if(index !== -1) {
			this._observers[index] = null
		}
	}

	sendEvent(name, args) {
		//console.log('sendEvent:', name, args)
		
		for(var index=0; index<this._observers.length; ++index) {
			let who = this._observers[index]

			if(who === null)
				continue

			let handler = who[name]

			if(handler) {
				handler.call(who, args)
			}
		}
	}
}

window.PeepleEvents = new PeepleEvents()