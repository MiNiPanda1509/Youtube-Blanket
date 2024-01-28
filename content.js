let ccs_props = {'opacity' : 0,
                'pointer-events': 'none' }

const elements = ['#content.style-scope.ytd-rich-item-renderer',
                  '#dismissible.style-scope.ytd-compact-video-renderer',
                  '#dismissible.style-scope.ytd-compact-radio-renderer']

function takeAction(input) {

    let state;
        state = 1 - input

        ccs_props.opacity = state

        if(state == 0 ) {
            ccs_props["pointer-events"] = 'none'
        }
        else {
            ccs_props["pointer-events"] = 'auto'
        }

        const keys = Object.keys(ccs_props);

        elements.forEach(ele => {
            keys.forEach(key => {
                $(ele).css(key, ccs_props[key])
            })              
        })
}

chrome.runtime.onMessage.addListener( (req, sender, res) => {
                
    if(req.todo == "toggle"){

        takeAction(req.newState)
    }

})

let isBlanket;
let currentTabId;

window.addEventListener('scroll', async () => {

    await chrome.runtime.sendMessage({ action: "getCurrentTabId" }, (res) => {
        currentTabId = res.tabId;
    });

    chrome.storage.sync.get(['tabsList'], (obj) => {
    
    
      
    if (obj.tabsList !== undefined && obj.tabsList.hasOwnProperty(currentTabId) ){
  
        let details = obj.tabsList[currentTabId]
        isBlanket = details.blanketOn  // check the last status and apply it on this
    }
    
    takeAction(isBlanket);

    })
});
