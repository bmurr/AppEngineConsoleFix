var historyPanelApp = angular.module('historyPanel', []);

historyPanelApp.controller('HistoryPanelCtrl', function ($scope) {

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
        if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+' GB';}
        else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
        else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes==1)          {bytes=bytes+' byte';}
        else                        {bytes='0 bytes';}
        return bytes;
    };

    $scope.renderTemplate = function() {
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
            $scope.history = [];

            var logCount = 0;
            angular.forEach(values[1].history, function(value, key){
                value.prettyTimestamp = $scope.prettyTime(new Date(value.timestamp));
                value.location = value.url.indexOf('localhost') !== -1 ? 'localhost' : 'appengine';
                value.contentLength = value.content.length;
                $scope.history.push(value);
//                $scope.options.selectedHistoryItem = $scope.history[Object.keys($scope.history)[0]];
                logCount += 1;
            });

            $scope.summary = {
                bytesInUse: $scope.prettyBytes(values[0]),
                logCount: logCount
            };

            $scope.$apply();
        });

    };

    $scope.selectHistoryItem = function(item){
        $scope.options.selectedHistoryItem = item;
    };

    $scope.renderTemplate();
    $scope.options = {selectedHistoryItem:null};

});

historyPanelApp.directive('codeArea', function(){

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

        scope.$watch('item', function(value) {
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
