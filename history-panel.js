(function () {

    var historyPanelApp = angular.module('historyPanel', []);

    historyPanelApp.controller('HistoryPanelCtrl', function ($scope, historyPanelSettings) {

        $scope.prettyTime = function (date) {
            return date.getFullYear() + "-"
                + ("0" + (date.getMonth() + 1)).slice(-2) + "-"
                + ("0" + date.getDate()).slice(-2) + " "
                + ("0" + date.getHours()).slice(-2) + ":"
                + ("0" + date.getMinutes()).slice(-2) + ":"
                + ("0" + date.getSeconds()).slice(-2) + "."
                + ("00" + date.getMilliseconds()).slice(-3);
        };

        $scope.prettyBytes = function (bytes) {
            if (bytes >= 1000000000) {
                bytes = (bytes / 1000000000).toFixed(2) + ' GB';
            }
            else if (bytes >= 1000000) {
                bytes = (bytes / 1000000).toFixed(2) + ' MB';
            }
            else if (bytes >= 1000) {
                bytes = (bytes / 1000).toFixed(2) + ' KB';
            }
            else if (bytes > 1) {
                bytes = bytes + ' bytes';
            }
            else if (bytes == 1) {
                bytes = bytes + ' byte';
            }
            else {
                bytes = '0 bytes';
            }
            return bytes;
        };

        $scope.renderTemplate = function () {
            var usagePromise = new Promise(function (resolve, reject) {
                chrome.storage.local.getBytesInUse(null, function (bytesInUse) {
                    resolve(bytesInUse);
                });
            });

            var dataPromise = new Promise(function (resolve, reject) {
                chrome.storage.local.get(null, function (historyObject) {
                    resolve(historyObject);
                });
            });

            Promise.all([usagePromise, dataPromise]).then(function (values) {

                var logCount = 0;
                angular.forEach(values[1].history, function (value, key) {
                    value.prettyTimestamp = $scope.prettyTime(new Date(value.timestamp));
                    value.location = value.url.indexOf('localhost') !== -1 ? 'localhost' : 'appengine';
                    value.contentLength = value.content.length;
                    historyPanelSettings.history.push(value);
                    $scope.history.push(value);
//                $scope.settings.selectedHistoryItem = $scope.history[Object.keys($scope.history)[0]];
                    logCount += 1;
                });

                $scope.summary = {
                    bytesInUse: $scope.prettyBytes(values[0]),
                    logCount: logCount
                };

                $scope.$apply();
            });

        };

        $scope.selectHistoryItem = function (item, index) {
            $scope.settings.selectedHistoryItem = item;
            $scope.settings.selectedHistoryItemIndex = $scope.settings.history.length - (index + 1);
        };

        $scope.keyDownHistoryItems = function (event) {
            console.log('keypress');
            console.log(event);
        };

        $scope.renderTemplate();
        $scope.settings = historyPanelSettings;
        $scope.history = [];

    });

    historyPanelApp.service('historyPanelSettings', function(){
        this.selectedHistoryItem = null;
        this.history = [];
    });

    historyPanelApp.directive('codeArea', function () {

        function link(scope, element, attrs) {
            var codeConfigOptions = {
                "mode": "python",
                "theme": "default",
                "indentUnit": 4,
                "keyMap": "sublime",
                "lineNumbers": true,
                "readOnly": true,
                "gutter": true,
                "fixedGutter": true,
                "flattenSpans": false,
                "extraKeys": {
                    "Ctrl-Space": "autocomplete"
                },
                "matchBrackets": true,
                "dragDrop": false,
                "viewportMargin": Infinity
            };
            scope.codearea = CodeMirror.fromTextArea(element[0], codeConfigOptions);

            scope.$watch('item', function (value) {
                scope.codearea.setValue(scope.item.content);
            });

        }

        return {
            scope: {
                item: '=?'
            },
            link: link
        };
    });

    historyPanelApp.directive('resizer', function ($document) {
        return function (scope, element, attr) {
            var startX = 200, x = 0
            element.css({
                border: '1px solid red'
            });
            element.on('mousedown', function (event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                startX = event.screenX - x;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                x = event.screenX - startX;
                element.css({
                    left: x + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        };
    });

    historyPanelApp.directive('scrollUpDown', function ($timeout, historyPanelSettings) {

        function handleUpDownEvent(scope, event){
            console.log([scope, event]);
            var selectedRowElement = jQuery('.column-one .selected');
            var rowHeight = selectedRowElement.height();
            var selectedRowElementPosition = selectedRowElement.position().top;

            var headerHeight = jQuery('.data-header').height();
            var footerHeight = jQuery('.summary-bar').height();

            var scrollingElement = jQuery('.column-one');
            var scrollingElementHeight = scrollingElement.height() - headerHeight - footerHeight;
            var scrollingElementPosition = scrollingElement.scrollTop();
            var scrollingElementMaxScrollPosition = scrollingElement.prop('scrollHeight') - scrollingElementHeight;
            if (event.which == UP_KEY) {
                if (selectedRowElementPosition - rowHeight < scrollingElementPosition){
                    scrollingElement.scrollTop(Math.max(scrollingElementPosition - rowHeight, 0));
                }
                newIndex = Math.min(historyPanelSettings.history.length - 1, historyPanelSettings.selectedHistoryItemIndex + 1);
            } else if (event.which == DOWN_KEY) {
                if (selectedRowElementPosition + (rowHeight * 2) > scrollingElementPosition + scrollingElementHeight){
                    scrollingElement.scrollTop(Math.min(scrollingElementPosition + rowHeight - ((scrollingElementPosition + rowHeight) % rowHeight) , scrollingElementMaxScrollPosition));
                }
                newIndex = Math.max(0, historyPanelSettings.selectedHistoryItemIndex - 1);
            }

            scope.$parent.$apply(function(){
                historyPanelSettings.selectedHistoryItem = historyPanelSettings.history[newIndex];
                historyPanelSettings.selectedHistoryItemIndex = newIndex;
            });

        }

        var newIndex;
        var UP_KEY = 38;
        var DOWN_KEY = 40;
        var timer;


        return function (scope, element, attrs) {
            element.on("keydown", function (event) {
                if (event.which == UP_KEY || event.which == DOWN_KEY){
                    console.log(timer);
                    $timeout.cancel(timer);
                    timer = $timeout(handleUpDownEvent, 1, true, scope, event);

                    event.stopPropagation();
                    event.preventDefault();
                }
            });
        };
    });

}());