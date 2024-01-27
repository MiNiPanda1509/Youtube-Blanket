chrome.runtime.onMessage.addListener( (req, sender, res) => {
    if(req.todo == "toggle"){

        let state;
        state = 1 - req.newState
        $('#content.style-scope.ytd-rich-item-renderer').css('opacity', state)
        $('#dismissible.style-scope.ytd-compact-video-renderer').css('opacity', state)
        $('#dismissible.style-scope.ytd-compact-radio-renderer').css('opacity', state)
    }

})
