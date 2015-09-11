var HistoryPanel = function () {
    var self = this;

    self.focus = function () {
        chrome.windows.update(self.window.id, { "focused": true });
    };

    self.openPanel = function () {
        var windowOptions = {
            'width': 500,
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

var historyPanel;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request && request.action === 'openHistoryPanel') {
        if (historyPanel !== undefined) {
            historyPanel.focus()
        } else {
            historyPanel = new HistoryPanel();
        }
    }
});