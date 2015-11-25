angular.module('historyPanel').directive('codeArea', function () {

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