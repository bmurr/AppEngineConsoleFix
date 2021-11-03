(function () {
    let historyPanelInstance = null;

    var HistoryPanel = function (namespace) {
        var self = this;

        self.namespace = namespace;

        self.bootstrapTab = function (tabId, changeInfo, tab) {
            if (tabId == self.window.tabs[0].id) {
                var request = {
                    config: {
                        namespace: self.namespace,
                    },
                };
                if (changeInfo.status == 'complete') {
                    chrome.tabs.sendMessage(tabId, request);
                }
            }
        };

        self.focus = function () {
            chrome.windows.update(self.window.id, { focused: true });
        };

        self.openPanel = function () {
            var windowOptions = {
                width: 900,
                height: 600,
                type: 'panel',
                url: 'historyPanel.html',
            };
            chrome.windows.create(windowOptions, function (window) {
                self.window = window;
                chrome.tabs.onUpdated.addListener(self.bootstrapTab);
            });
        };

        self.openPanel();
    };

    chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
    ) {
        if (request && request.action === 'openHistoryPanel') {
            if (!!historyPanelInstance) {
                historyPanelInstance.focus();
            } else {
                historyPanelInstance = new HistoryPanel(request.namespace);
            }
        }
    });

    chrome.windows.onRemoved.addListener(function (windowID) {
        if (
            historyPanelInstance &&
            windowID === historyPanelInstance.window.id
        ) {
            historyPanelInstance = null;
        }
    });
})();
