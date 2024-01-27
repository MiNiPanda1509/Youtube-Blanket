// This event is fired when the extension is installed for the first time
chrome.runtime.onInstalled.addListener( async () => {
    // page action extension first disabled across and then enabled only for particular tabs
    chrome.action.disable();
    // Clear all rules to ensure only our expected rules are set
    chrome.declarativeContent.onPageChanged.removeRules( undefined, () => {
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
      chrome.declarativeContent.onPageChanged.addRules(rules)
    })

    for (const cs of chrome.runtime.getManifest().content_scripts) {
      for (const tab of await chrome.tabs.query({url: cs.matches})) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: cs.js,
        });
      }
    }

})

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  chrome.storage.sync.get(['tabsList'], (obj) => {
    
    let isBlanket;

    if (obj.tabsList !== undefined && obj.tabsList.hasOwnProperty(tabId) ){

      let details = obj.tabsList[tabId]
      isBlanket = details.blanketOn  // check the last status and apply it on this
    }
  
    chrome.tabs.sendMessage(tabId, {todo: "toggle", newState: isBlanket})
  })
})

chrome.storage.onChanged.addListener( (changes) => { //changes is an object which keeps track of the old and new value of keys stored in storage
  if (changes.blanketOffCount !== undefined)
    chrome.action.setBadgeText({"text": changes.blanketOffCount.newValue.toString()}) //text is a property defined inside setBadgeText()
})