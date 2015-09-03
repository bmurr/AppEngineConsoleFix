if (window.AppEngineConsoleFix === undefined) {
    (function (AppEngineConsoleFix, $, undefined) {

        var self = this;

        self.getInputArea = function() {
            var inputarea = $('#code')[0];
            if (inputarea === undefined) {
                inputarea = $('#code_text')[0];
            }
            return inputarea;
        };

        self.loadHistory = function() {
            var url = window.location.hostname;
            var history_key = url.indexOf('localhost') !== -1 ? 'localhost' : 'appengine';
            self.getHistoryUsage();
            console_history = chrome.storage.local.get(null, function (history_object) {
                console.log(history_object);
            });
        };

        self.getHistoryUsage = function() {
            chrome.storage.local.getBytesInUse(null, function (bytesInUse) {
                console.log(['AppEngine Console Extension is using ', bytesInUse, ' bytes of storage.'].join(''));
            });
        };

        self.saveHistory = function(content) {
            var url = window.location.hostname;
            var history_key = url.indexOf('localhost') !== -1 ? 'localhost' : 'appengine';
            var timestamp = (new Date()).toISOString();


            chrome.storage.local.get(history_key, function (item) {

                var history_object = {};

                if (!$.isEmptyObject(item)) {
                    history_object = item[history_key];
                }

                history_object[timestamp] = content;

                var storage_object = {};
                storage_object[history_key] = history_object;

                chrome.storage.local.set(storage_object);
                chrome.storage.local.clear();
            });
        };

        AppEngineConsoleFix.editTable = function () {

            var inputarea = self.getInputArea();
            //Make the textareas rows instead of columns.
            $('#console tbody').prepend($('#code').parent());
            $('#code').parent().wrap('<tr>');

            //Move the 'Run Program' button to the top
            $('#submitbutton').closest('tr').detach().insertAfter($('#console tr:first'));
            $('#submitbutton').css({
                'float': 'left',
                'height': '30px'
            });

            //Remove footer
            $('#ft').remove();

            //Give output box more height
            $('#output').css('height', '1000px');

            //Remove padding on header
            $('#ae-content h3').css('padding', '0px');

            //Add checkbox toggles
            $('<span id="controls"></span').insertBefore($(inputarea));
            var checkbox1 = '<span><input type="checkbox" id="wspaceBox"><label for="wspaceBox">Show whitespace</label></span>';

            var historyLink = '<a href="javascript:void(0)" id="historyLink"> Show History</a>';


            $('#controls').append(checkbox1);
            $('#controls').append(historyLink);
            $('#wspaceBox').click(function () {
                var checked = $(this).is(':checked');
                if (checked) {
                    console.log('checked');
                    self.codearea.setOption('mode', 'pythonWS');
                }
                else {
                    console.log('unchecked');
                    self.codearea.setOption('mode', 'python');
                }
            });

            $('#historyLink').click(function () {
                self.loadHistory();
            });
        };

        AppEngineConsoleFix.createCodeArea = function () {
            //Replace textarea with codemirror editor

            //Give console table a fontsize setting, because the new code area inherits fontsize settings from it
            $('#console').css('font-size', '10pt');

            var inputarea = self.getInputArea();

            var codeConfigOptions = {
                // value (string)
                "mode": "python",
                "theme": "default",
                "indentUnit": 4,
                // smartIndent (boolean)
                // tabSize (integer)
                // indentWithTabs (boolean)
                // electricChars (boolean)
                // autoClearEmptyLines (boolean)
                "keyMap": "sublime",
                // extraKeys (object)
                // lineWrapping (boolean)
                "lineNumbers": true,
                // firstLineNumber (integer)
                // lineNumberFormatter (function(integer))
                "gutter": true,
                "fixedGutter": true,
                "flattenSpans": false,
                "extraKeys": {
                    "Ctrl-Space": "autocomplete"
                },
                // readOnly (boolean)
                // onChange (function)
                // onCursorActivity (function)
                // onViewportChange (function)
                // onGutterClick (function)
                // onScroll (function)
                // onUpdate (function)
                "matchBrackets": true,
                // cursorBlinkRate (number)
                // pollInterval (number)
                // undoDepth (integer)
                // tabindex (integer)
                // autofocus (boolean)
                "dragDrop": false
                // onDragEvent (function)
                // onKeyEvent (function)
            };
            CodeMirror.commands.autocomplete = function (cm) {
                CodeMirror.showHint(cm, CodeMirror.hint.anyword);
            };
            CodeMirror.defineMode("pythonWS", function (config, parserConfig) {
                var spaceOverlay = {
                    token: function (stream, state) {
                        var ch;
                        while ((ch = stream.next()) != null) {
                            if (ch == ' ') {
                                return 'space';
                            }
                            if (ch == '\t') {
                                return 'ctab';
                            }
                            return null;
                        }
                    }
                };
                return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "python"), spaceOverlay);
            });

            console.log([inputarea, codeConfigOptions]);

            self.codearea = CodeMirror.fromTextArea(inputarea, codeConfigOptions);

            // one is for localhost, other for AppEngine console
            var submit_button = $('#execute_button') === null ? $('#submitbutton') : $('#execute_button');

            submit_button.click(function () {
                self.codearea.save();
                self.saveHistory(codearea.getValue());
            });

            //Border around codemirror textarea
            $('.CodeMirror').css('border', '1px solid #C9C9C9');
        };

        $('document').ready(function () {
            //Make input box auto-resize
            $('.CodeMirror').css('height', 'auto');
            AppEngineConsoleFix.editTable();
            AppEngineConsoleFix.createCodeArea();
        });

        //If we're not in an iframe (i.e page is being viewed from application admin panel)
        if (top === self) {
            $('.g-doc-1024').css('width', '98%');
            $('#ae-content').css('height', '2000px');
            $('iframe').attr('height', '100%');
            $('#ae-custom-page').css('height', '100%');
        }
        //If we are in an iframe, (i.e page is being viewed from main GAE admin panel)
        else {
            //Remove the left hand nav bar and reset margin
            $('#ae-lhs-nav').remove();
            $('#ae-content').css('margin', '0px');
            $('#ae-content').css('border-left', '0px');
            $('#ae-content').css('padding-left', '0px');
            $('#ae-custom-page').css('height', '100%');
        }

    }(window.AppEngineConsoleFix = window.AppEngineConsoleFix || {}, window.jQuery));
}

