function() {
    window.makeServerRequest = (url, callback) => {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 10000

        xhr.open('GET', url);

        if(url.indexOf('.peeple.io') !== -1)
    		xhr.setRequestHeader('Access-Control-Allow-Origin', window.location.origin)

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
                }

            	//console.log(response)

                if (callback) {
                	callback(response)
                }
            }
        }

        //console.log(url)
        xhr.send()

        return xhr
    }

    // @TODO: SNICHOLS: optimize this
    window.computeObjectDelta = (left, right) => {
        var result

        left = left || {}
        right = right || {}

        for(var key in left) {
            var leftValue = left[key]
            var rightValue = right[key]

            if(leftValue !== rightValue) {
                result = result || {}
                result[key] = rightValue
            } 
        }

        for(var key in right) {
            var leftValue = left[key]
            var rightValue = right[key]

            if(leftValue !== rightValue) {
                result = result || {}
                result[key] = rightValue
            } 
        }

        //console.log('computeObjectDelta:', left, right, result)

        return result
    }

    window.getCurrentTime = () => {
        return (Date.now()/1000)|0
    }
}()
