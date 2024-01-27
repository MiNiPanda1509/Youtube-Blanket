$(function(){
  
  function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  chrome.storage.sync.get('limit', obj => {
    $('#limit').text(obj.limit);

    let lmt = $('#limit').text()

    if(!isNumeric(lmt)) {
      const h2 =  document.getElementsByTagName("h2")[0];
      var elem = document.createElement('div');
      elem.innerHTML = "<br /> It's better to set a Limit!";
  
      if ($('h2 div').length == 0) // If child doesn't exist already
        h2.appendChild(elem)
    }
    else{
      const elem =  $('h2 div');
      // if(elem)
        elem.remove();
    }
  

  })


  $('#btnClick').click( () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      /* Initially on load, blanket is there. We reach at this point when
        Toggle button is clicked. This means user wants to remove the blanket.
      */
      let isBlanket = 0;
      let pullBlanketOff = 1;
        // chrome.storage.sync.get(['tabsList', 'blanketOn', 'blanketOffCount', 'limit'], (obj) => {
           chrome.storage.sync.get(['tabsList', 'blanketOffCount', 'limit'], (obj) => {
   
        /*
        When chrome storage has this object stored, means this is NOT the first button click.
        Update the state (from 0 to 1) or (from 1 to 0).
        */
        
        let storeList = {}

        if (obj.tabsList !== undefined && obj.tabsList.hasOwnProperty(tabs[0].id) ){
          // isBlanket = 1 - obj.blanketOn  // to toggle the blanket
          // tabsList = obj.tabsList

          let details = obj.tabsList[tabs[0].id]
          isBlanket = 1 - details.blanketOn
        }
        
        storeList[tabs[0].id] = {
          "blanketOn": isBlanket,
        }

        if(obj.blanketOffCount !== undefined){
            pullBlanketOff  = obj.blanketOffCount + 1
        }
        

         chrome.storage.sync.set({'tabsList': storeList, blanketOffCount: pullBlanketOff}, () => {
          
          if(pullBlanketOff > obj.limit){
            let notifOptions = {
              type: 'basic',
              title: 'Limit reached',
              message: "Maybe it's time to focus now!!",
              iconUrl: 'yt_n.png',
          }
            if(isBlanket == 0) // if blanket is removed
              chrome.notifications.create('limitNotif', notifOptions) //limitNotif is the ID for this notification

          }
        })

        chrome.tabs.sendMessage(tabs[0].id, {todo: "toggle", newState: isBlanket})
      })
      chrome.storage.onChanged.addListener( (changes) => {
        if (changes.blanketOffCount !== undefined)
          chrome.action.setBadgeText({"text": changes.blanketOffCount.newValue.toString()})
      })

      
    })
    
  })
  
})