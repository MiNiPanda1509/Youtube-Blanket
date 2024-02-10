// Remove or Put on blanket depending on the input being passed 
function takeAction(input) {

    let ccs_props = {'opacity' : 0,
                'pointer-events': 'none' }

    const elements = ['#content.style-scope.ytd-rich-item-renderer',
                  '#dismissible.style-scope.ytd-compact-video-renderer',
                  '#dismissible.style-scope.ytd-compact-radio-renderer',
                  '#dismissible.style-scope.ytd-compact-playlist-renderer',
                  'ytd-playlist-panel-renderer#playlist.style-scope.ytd-watch-flexy',
                //   'ytd-playlist-panel-video-renderer#playlist-items.style-scope.ytd-playlist-panel-renderer',
                // 'ytd-reel-item-renderer.style-scope.yt-horizontal-list-renderer',
                // 'ytd-reel-shelf-item-renderer.style-scope.yt-item-section-renderer'
            ]

    let state;
        state = 1 - input

        ccs_props.opacity = state

        if(state == 0 ) {
            ccs_props["pointer-events"] = 'none !important'
        }
        else {
            ccs_props["pointer-events"] = 'auto !important'
        }

        const keys = Object.keys(ccs_props);
       
        elements.forEach(ele => {
            let inlineStyle = ""
            keys.forEach(key => {
                inlineStyle += key + ":" + ccs_props[key] + ";"
            }) 
            $(ele).attr('style', inlineStyle);             
        })
}

function myPromise(input) {
    return new Promise ((resolve, reject) => {
        try{
            takeAction(input);
            resolve();
        }catch(err){
            reject(err)
        }
    })
}
// background script instructs to take action when user clicks on the extension icon
chrome.runtime.onMessage.addListener( async (req, sender, res) => {
    try {            
        if(req.todo == "toggle"){
            await myPromise(req.newState)
        } 
    }catch(err){}

})

let isBlanket;
let currentTabId;
let user_actions = ["scroll", "click"]

// Detect scrolling or clicking and apply the blanket action on the dynamically loaded videos
user_actions.forEach( action => {
    document.addEventListener(action, async (event) => {
        try{
            if(event.target === "video.video-stream.html5-main-video"){  // Clicking on a video to play or pause shall be ignored
                return; 
            }
              // Ask service worker to send the current tab ID
            await chrome.runtime.sendMessage( "getCurrentTabId" , async (res) => {
                currentTabId = res.tabId;
                await chrome.storage.sync.get(['tabsList'], async (obj) => {
        
                    if (obj.tabsList !== undefined && obj.tabsList.hasOwnProperty(currentTabId) ){
                
                        let details = obj.tabsList[currentTabId]
                        isBlanket = details.blanketOn  // check the last status and apply it on this
                        await myPromise(isBlanket);  // take the blanket Action on the current tab
                    }
                })
            });
        }catch(err){}

    });
})
