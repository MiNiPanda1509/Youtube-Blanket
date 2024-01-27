$(function(){

    function isNumeric(str) {
        if (typeof str != "string") return false // we only process strings!  
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
               !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
      }

    chrome.storage.sync.get('limit', (obj) => {
        $('#limit').val(obj.limit);
    })

    $('#saveLimit').click(() => {
        
        let lmt = $('#limit').val()

        if(lmt && isNumeric(lmt)){
            chrome.storage.sync.set({'limit':parseInt(lmt)}, () => {
                close() //close the tab after this
            })
        }else{
            chrome.storage.sync.remove('limit', () => {
                close() //close the tab after this
            })
        }
    })

    $('#resetCount').click(() => {
        
        chrome.storage.sync.set({'blanketOffCount': 0}, () => {
            close() //close the tab after this
        })

    })
   
    chrome.storage.onChanged.addListener( (changes) => {
        if (changes.blanketOffCount !== undefined)
            chrome.action.setBadgeText({"text": changes.blanketOffCount.newValue.toString()})
    })
})