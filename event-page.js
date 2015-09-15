var HistoryPanel = function () {
    var self = this;

    self.focus = function () {
        chrome.windows.update(self.window.id, { "focused": true });
    };

    self.openPanel = function () {
        var windowOptions = {
            'width': 900,
            'height': 600,
            'type': 'panel',
            'url': 'historyPanel.html'
        };
        chrome.windows.create(windowOptions, function (window) {
            self.window = window;
        })
    };

    self.openPanel();
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request && request.action === 'openHistoryPanel') {
        if (!!window.historyPanel) {
            window.historyPanel.focus()
        } else {
            window.historyPanel = new HistoryPanel();
        }
    }
});

chrome.windows.onRemoved.addListener(function(windowID){
   if (windowID === window.historyPanel.window.id){
       window.historyPanel = null;
   }
});