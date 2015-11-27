angular.module('historyPanel')
    .controller('HistoryPanelCtrl', function ($scope, flexGridConfigFactory) {

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
                var history = [];
                angular.forEach(values[1].history, function (value, key) {
                    value.prettyTimestamp = $scope.prettyTime(new Date(value.timestamp));
                    value.location = value.url.indexOf('localhost') !== -1 ? 'localhost' : 'appengine';
                    value.contentLength = value.content.length;
                    history.push(value);
                    logCount += 1;
                });
                history.reverse();

                $scope.summary = {
                    bytesInUse: $scope.prettyBytes(values[0]),
                    logCount: logCount
                };

                $scope.historyConfig.setData(history);
                $scope.$apply();
            });

        };

        function selectedCallback(event, rowIndex, columnIndex){
            $scope.historyConfig.selectedHistoryItem = $scope.historyConfig.data[rowIndex];
            var target = event.target;
            var columnOneWidth = angular.element(angular.element(target).closest('.flex-grid-root').find('.header-container col')[0]).css('width');
            $scope.columnOneStyle = $scope.historyConfig.selectedHistoryItem ? '0 0 ' + columnOneWidth : '1 1 auto';
        }

        $scope.history = [];
        $scope.historyConfig = new flexGridConfigFactory.FlexGridConfig();
        $scope.historyConfig.setHeaderMap({prettyTimestamp: 'Timestamp', url: 'URL', location: 'Location', contentLength: 'Size', content: 'Content'});
        $scope.historyConfig.setColumnWidthPercentages([20, 25, 10, 5, 40]);
        $scope.historyConfig.setSelectedCallback(selectedCallback);
        $scope.historyConfig.numColumns = [0, 1, 2, 3, 4];

        $scope.renderTemplate();


    });