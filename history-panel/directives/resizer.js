angular.module('historyPanel').directive('resizer', function ($document) {
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