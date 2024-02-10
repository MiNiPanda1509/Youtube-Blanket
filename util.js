function triggerAction(tabID) {

    /* Initially on tab creation, blanket is there. We arrive at this point only when
      extension icon is clicked. This means user wants to remove the blanket. We don't have anything in chrome storage (first time after extension is loaded).
      Note that these initialized values are only required for the first time after extension load and later gets overwritten by the chrome.storage.get value.
    */
    let isBlanket = 0; // blanket should NOT be there so false (0)
    let pullBlanketOff = 1; // Action is to pull off the blanket so (1)

         chrome.storage.sync.get(['tabsList', 'blanketOffCount', 'limit'], async (obj) => {
 
      /*
      When chrome storage has this object stored, means this is NOT the first button click.
      Update the state (from 0 to 1) or (from 1 to 0).
      */
      
      let storeList = {}

      if (obj.tabsList !== undefined && obj.tabsList.hasOwnProperty(tabID) ){ // When chrome storage has this means not the first time

        let details = obj.tabsList[tabID] // gives current status of the blanket in the current tab
        /* If blanket is currently there ( isBlanket = 1), then it shouldn't be there after this click (isBlanket_new = 1 - isBlanket = 1 -1 = 0).
          If blanket is currently NOT there ( isBlanket = 0), then it should be there after this click (isBlanket_new = 1 - 0 = 1 - 0 = 1).
        */
        isBlanket = 1 - details.blanketOn 
      }

      //Store blanket status for this tab
      storeList[tabID] = {
        "blanketOn": isBlanket,
      }

      // Increase the count of number of actions being taken on the blanket
      if(obj.blanketOffCount !== undefined){
          pullBlanketOff  = obj.blanketOffCount + 1
      }
      

       chrome.storage.sync.set({'tabsList': storeList, blanketOffCount: pullBlanketOff}, () => {
        
        if(pullBlanketOff > obj.limit){  //If limit is not set from options page then this won't execute
          let notifOptions = {
            type: 'basic',
            title: 'Limit reached',
            message: "Maybe it's time to focus now!!\n Right click on icon --> Options to set limit or reset counter",
            iconUrl: 'icons/yt_blanket.png',
        }
          if(isBlanket == 0) // When toggling is such that if blanket is REMOVED, then only push the "focus" notification
            chrome.notifications.create('limitNotif', notifOptions) //limitNotif is the ID for this notification
        }
      })

      // Content script is waiting for some message with todo == "toggle" and pass the blanket info
      await chrome.tabs.sendMessage(tabID, {todo: "toggle", newState: isBlanket}) 
    })

    // Update the badge text
    chrome.storage.onChanged.addListener( (changes) => {
      if (changes.blanketOffCount !== undefined)
        chrome.action.setBadgeText({"text": changes.blanketOffCount.newValue.toString()})
    })

}

export {triggerAction}