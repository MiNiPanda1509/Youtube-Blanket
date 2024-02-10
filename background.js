import {triggerAction} from "./util.js";

// This event is fired when the extension is installed for the first time
chrome.runtime.onInstalled.addListener( async () => {

    // page action extension first disabled across and then enabled only for particular tabs
    chrome.action.disable();
    // Clear all rules to ensure only our expected rules are set
    await chrome.declarativeContent.onPageChanged.removeRules( undefined, async () => {

      // Declare a rule to enable the action on youtube.com pages
      let rule1 = {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: '.youtube.com'}
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
      }
      // Finally, apply our new array of rules
      let rules = [rule1];
      await chrome.declarativeContent.onPageChanged.addRules(rules)
    })
})

//When in the same tab some different URL is passed then that old status (whether blanket was there or not) needs to be propagated
chrome.tabs.onUpdated.addListener((tabId, tab) => {

  chrome.storage.sync.get(['tabsList'], async (obj) => {
    
    try {
        let isBlanket;

        if (obj.tabsList !== undefined && obj.tabsList.hasOwnProperty(tabId) ){

          let details = obj.tabsList[tabId]
          isBlanket = details.blanketOn  // check the last status and apply it on this
          await chrome.tabs.sendMessage(tabId, {todo: "toggle", newState: isBlanket})
        }  
    } catch(err){}

  })
})

//Updates the badge
chrome.storage.onChanged.addListener( (changes) => { //changes is an object which keeps track of the old and new value of keys stored in storage
  if (changes.blanketOffCount !== undefined)
    chrome.action.setBadgeText({"text": changes.blanketOffCount.newValue.toString()}) //text is a property defined inside setBadgeText()
})

// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener( (req, sender, sendResponse) => {
  if (req === "getCurrentTabId") {
    // Get the current tab ID from the sender object
    const currentTabId = sender.tab.id;

    // Send the current tab ID back to the content script
    sendResponse({ tabId: currentTabId });
  }
});

//Call the function when user clicks on the extension icon on the toolbar
chrome.action.onClicked.addListener( (tab) => {
    triggerAction(tab.id)
});


// Resetting the counter at midnight
// setInterval( () => {
//     let now = new Date();
//     let hours = now.getHours();
//     let mins = now.getMinutes();
//     let secs = now.getSeconds();

//      //Store last day's record and reset the counter to 0
//     if (hours === 0 && mins === 0 && (secs >= 0 && secs <= 5 )) {
//         chrome.storage.sync.get('blanketOffCount', (obj) => {
//         let count = parseInt(obj.blanketOffCount)
        
//         chrome.storage.sync.set({'lastDayCount': count})
//     })
//       chrome.storage.sync.set({'blanketOffCount': 0})
//     }

// }, 1000);
