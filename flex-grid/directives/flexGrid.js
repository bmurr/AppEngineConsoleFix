angular.module('flexGrid')
    .directive('flexGrid', function ($timeout, $window, $document) {
        var config, columnWidthPercentages, columnWidthPixels;

        function syncHeaderDataColumnWidths(rootElement) {
            var headerColumns = rootElement.find('.header-container col');
            var dataColumns = rootElement.find('.data-container tr:first-of-type td');
            angular.forEach(dataColumns, function (item, index) {
                var dataColumnWidth = angular.element(item).outerWidth();
                angular.element(headerColumns[index]).css('width', dataColumnWidth);
            })

        }

        function setDataColumnWidths(rootElement) {
            var columnWidth;
            var dataColumns = rootElement.find('.data-container col');
            var rootElementWidth = rootElement.outerWidth();

            angular.forEach(dataColumns, function (item, index) {
                if (!columnWidthPixels[index]) {
                    columnWidth = Math.max(rootElementWidth * (columnWidthPercentages[index] / 100.0), config.minWidth);
                    columnWidthPixels[index] = columnWidth;

                } else {
                    columnWidth = columnWidthPixels[index];
                }
                angular.element(item).css('width', columnWidth + 'px');
            });

        }

        function setColumnResizerPositions(rootElement) {
            var dataColumns = rootElement.find('.data-container tr:first-of-type td');
            var resizers = rootElement.find('.data-grid-resizer');
            var totalLeft = 0;
            angular.forEach(dataColumns.slice(0, -1), function (item, index) {
                totalLeft += angular.element(item).outerWidth();
                angular.element(resizers[index]).css('left', totalLeft - 2);
            });
        }

        function onResize($rootElement) {
            setDataColumnWidths($rootElement);
            syncHeaderDataColumnWidths($rootElement);
            setColumnResizerPositions($rootElement);
        }

        function resizeColumn($event) {

            function mousemove(event) {
                var columnWidthPixelsCopy = columnWidthPixels.slice();
                var x = event.screenX - startX;

                columnWidthPixelsCopy[resizerIndex] = initialColumnWidths[resizerIndex] + x;
                columnWidthPixelsCopy[columnWidthPixelsCopy.length - 1] = initialColumnWidths[columnWidthPixelsCopy.length - 1] - x;

                if (columnWidthPixelsCopy.every(function (item) {
                    return item >= config.minWidth;
                })) {
                    columnWidthPixels = columnWidthPixelsCopy;
                    angular.forEach(columnWidthPercentages, function (item, index) {
                        var pixelAsPercentage = Math.max(columnWidthPixels[index] / rootElement.outerWidth() * 100.0, config.minWidth);
                        columnWidthPercentages[index] = pixelAsPercentage;
                    })
                }
                onResize(rootElement);
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }

            $event.preventDefault();
            $event.stopPropagation();
            var element = angular.element($event.target);
            var rootElement = element.closest('.flex-grid-root');
            var dataColumns = rootElement.find('.data-container tr:first-of-type td');

            var startX = event.screenX;
            var resizerIndex = element.data('index');
            var initialColumnWidths = columnWidthPixels.slice();

            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        }

        function keyDownHandler(event) {
            var Keys = {
                Left: { code: 37, name: "\u2190" },
                Up: { code: 38, name: "\u2191" },
                Right: { code: 39, name: "\u2192" },
                Down: { code: 40, name: "\u2193" }
            };

            function upKeyHandler() {

            }

            function downKeyHandler() {

            }

            if (event.keyCode === Keys.Up.code) {
                // event.preventDefault();
                // event.stopPropgation();
                upKeyHandler();
            } else if (event.keyCode === Keys.Down.code) {
                // event.preventDefault();
                // event.stopPropgation();
                downKeyHandler();
            }
            console.log(event);
        }

        function postLink($scope, $element, $attr, ctrl, $transcludeFn) {

            config = $scope.config;

            $scope.numColumns = config.numColumns;
            columnWidthPercentages = config.columnWidthPercentages;
            columnWidthPixels = [];

            $scope.resizeColumn = resizeColumn;
            $scope.selectRow = selectRow;

            function selectRow(event, rowIndex, columnIndex) {
                $scope.$emit('row-selected', {row: rowIndex, column: columnIndex });
                $scope.config.selectedCallback(event, rowIndex, columnIndex);
                $scope.selectedRowIndex = rowIndex;
            }

            angular.element($window).bind('resize', function () {
                columnWidthPixels = [];
                onResize($element);
            });

            $scope.$on('resize', function () {
                columnWidthPixels = [];
                onResize($element);
            });

//            angular.element($element).on('keydown', keyDownHandler);


            //$timeout is run after iterpolation/rendering is complete.
            $timeout(function () {
                onResize($element);
            })
        }

        function compile($element, $attr) {
            return postLink;
        }

        return {
            restrict: 'AE',
            scope: {
                config: '='
            },
            priority: 900,
//            terminal: false,
            compile: compile,
            templateUrl: 'flex-grid/templates/flexGridTemplate.html'
        };
    });