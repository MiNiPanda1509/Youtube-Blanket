let ccs_props = {'opacity' : 0,
                'pointer-events': 'none' }

const elements = ['#content.style-scope.ytd-rich-item-renderer',
                  '#dismissible.style-scope.ytd-compact-video-renderer',
                  '#dismissible.style-scope.ytd-compact-radio-renderer' ]

chrome.runtime.onMessage.addListener( (req, sender, res) => {
                
    if(req.todo == "toggle"){

        let state;
        state = 1 - req.newState

        ccs_props.opacity = state

        if(state == 0 ) ccs_props["pointer-events"] = 'none'
        else ccs_props["pointer-events"] = 'auto'

        const keys = Object.keys(ccs_props);

        elements.forEach(ele => {
            keys.forEach(key => {
                $(ele).css(key, ccs_props[key])
            })              
        })
    }

})
