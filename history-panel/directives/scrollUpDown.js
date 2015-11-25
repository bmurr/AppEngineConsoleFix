angular.module('historyPanel').directive('scrollUpDown', function ($timeout, historyPanelSettings) {

    function handleUpDownEvent(scope, event) {
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
            if (selectedRowElementPosition - rowHeight < scrollingElementPosition) {
                scrollingElement.scrollTop(Math.max(scrollingElementPosition - rowHeight, 0));
            }
            newIndex = Math.min(historyPanelSettings.history.length - 1, historyPanelSettings.selectedHistoryItemIndex + 1);
        } else if (event.which == DOWN_KEY) {
            if (selectedRowElementPosition + (rowHeight * 2) > scrollingElementPosition + scrollingElementHeight) {
                scrollingElement.scrollTop(Math.min(scrollingElementPosition + rowHeight - ((scrollingElementPosition + rowHeight) % rowHeight), scrollingElementMaxScrollPosition));
            }
            newIndex = Math.max(0, historyPanelSettings.selectedHistoryItemIndex - 1);
        }

        scope.$parent.$apply(function () {
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
            if (event.which == UP_KEY || event.which == DOWN_KEY) {
                console.log(timer);
                $timeout.cancel(timer);
                timer = $timeout(handleUpDownEvent, 1, true, scope, event);

                event.stopPropagation();
                event.preventDefault();
            }
        });
    };
});