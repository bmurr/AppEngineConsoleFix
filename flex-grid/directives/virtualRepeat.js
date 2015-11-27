angular.module('flexGrid')
    .directive('virtualRepeat', function ($parse) {

        var identifier;
        var collectionName;
        var collection;
        var prevScrollHeight = 0;


        function postLink($scope, $element, $attr, ctrl, $transcludeFn) {

            function makeNewScope(idx, collection, containerScope) {
                var childScope = containerScope.$new();
                childScope[identifier] = collection[idx];
                childScope.$index = idx;
                childScope.$first = (idx === 0);
                childScope.$last = (idx === (collection.length - 1));
                childScope.$middle = !(childScope.$first || childScope.$last);
                return childScope;
            }

            function renderElements(start, end, collection, containerScope, insPoint) {
                var frag = document.createDocumentFragment();
                var renderedElementScopes = [];
                var newElements = [], element, idx, childScope;
                end = Math.min(collection.length, end);
                for (idx = start; idx !== end; idx++) {
                    childScope = makeNewScope(idx, collection, containerScope);
                    element = $transcludeFn(childScope, angular.noop);
                    newElements.push(element);
                    renderedElementScopes.push(childScope);
                    frag.appendChild(element[0]);
                }
                insPoint.after(frag);
                return renderedElementScopes;
            }

            function updateElements(start, end, collection) {
                for (var i = 0; i < renderedElementScopes.length; i++) {
                    renderedElementScopes[i].$index = i + start;
                    renderedElementScopes[i][identifier] = collection[i + start];
                }
            }

            function scrollEvent(event) {
                var scrollHeight = event.target.scrollTop;

                if (scrollHeight > prevScrollHeight) {
                    //Scrolled down
                } else if (scrollHeight < prevScrollHeight) {
                    //Scrolled up
                } else {
                    //Didn't scroll
                }

                $scope.$apply(function () {
                    $scope.scrollHeight = scrollHeight;
                    var start = Math.ceil((scrollHeight - (rowHeight * rowsAbove)) / rowHeight);

                    if (start < 0) {
                        start = 0;
                    } else if (start > collection.length - (maxRowsShown + rowsAbove)) {
                        start = collection.length - (maxRowsShown);
                    }
                    tableElement.css('top', start * rowHeight);
                    updateElements(start, start + maxRowsShown, collection);
                });
                prevScrollHeight = scrollHeight;
            }

            collection = $parse(collectionName)($scope);

            var viewportElement = jQuery('.data-container');
            var tableElement = jQuery('table.data');
            tableElement.wrap('<div class=".virtual-scroll-container"></div>');
            var tableContainer = tableElement.parent();

            var start = 0;
            var rowsInViewport = 30;
            var rowHeight = 21;

            var rowsAbove = 30;
            var rowsBelow = 30;
            var maxRowsShown = rowsAbove + rowsInViewport + rowsBelow;
            var renderedElementScopes;


            viewportElement.on('scroll', scrollEvent);
            $scope.$watch(collectionName, function(newValue, oldValue){
                collection = newValue;
                renderedElementScopes = renderElements(start, maxRowsShown, collection, $scope, $element);
                tableContainer.css('height', (collection.length * rowHeight ) + 'px');
            });

        }

        function compile($element, $attr) {
            var expression = $attr.virtualRepeat;
            var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

            identifier = match[1];
            collectionName = match[2];


            return postLink;
        }

        return {
            restrict: 'A',
            transclude: 'element',
            priority: 1000,
//            terminal: true,
            compile: compile
        };
    });