if (window.AppEngineConsoleFix === undefined) {
    (function (AppEngineConsoleFix, $, undefined) {

        var self = AppEngineConsoleFix;

        function betterTab(cm) {
            if (cm.somethingSelected()) {
                cm.indentSelection('add');
            } else {
                cm.replaceSelection(cm.getOption('indentWithTabs') ? '\t' :
                    new Array(cm.getOption('indentUnit') + 1).join(" "), 'end', '+input');
            }
        }

        self.getInputArea = function () {
            return $('#code')[0] || $('#code_text')[0];
        };

        self.openHistoryPanel = function(){
            var request = {
                action: 'openHistoryPanel'
            };
            chrome.runtime.sendMessage(request);
        };

        self.loadHistory = function () {
            self.getHistoryUsage();
            chrome.storage.local.get('history', function (history_object) {
                console.log(history_object);
            });
        };

        self.getHistoryUsage = function () {
            chrome.storage.local.getBytesInUse(null, function (bytesInUse) {
                console.log(['AppEngine Console Extension history is using ', bytesInUse, ' bytes of storage.'].join(''));
            });
        };

        self.saveHistory = function (content) {
            var hostname = window.location.hostname;
            var url = window.location.href;
            var timestamp = (new Date()).toISOString();

            chrome.storage.local.get('history', function (storage) {
                var entry = {
                    content: content,
                    url: url,
                    timestamp: timestamp
                };

                if (!$.isEmptyObject(storage)) {
                    storage.history[timestamp] = entry;
                } else {
                    storage['history'] = {};
                    storage['history'][timestamp] = entry;
                }

                chrome.storage.local.set(storage);
            });
        };

        self.clearHistory = function (){
            chrome.storage.local.clear();
        };

        AppEngineConsoleFix.editTable = function () {

            var inputarea = self.getInputArea();
            //Make the textareas rows instead of columns.
            $('#console tbody').prepend($('#code').parent());
            $('#code').parent().wrap('<tr>');

            //Move the 'Run Program' button to the top
            $('#submitbutton').closest('tr').detach().insertAfter($('#console tr:first'));

            //Remove footer
            $('#ft').remove();

            //Give output box more room.
            $('#output').css('height', '1000px');

            //Add controls
            var template = ['<div id="controls" style="font-size: 20px">',
                            '    <div style="float:left"><a href="javascript:void(0)" id="showWhitespaceButton" title="Show Whitespace"><i class="ion-ios-eye-outline"></i></a></div>',
                            '    <div><a href="javascript:void(0)" id="showHistoryButton" title="Show History"><i class="ion-clock"></i></a></div>',
                            '</div>'];

            $(template.join('')).insertBefore($(inputarea));

            $('#showWhitespaceButton').click(function () {
                var checked = !($(this).hasClass('checked'));

                if (checked) {
                    self.codearea.setOption('mode', 'pythonWS');
                    $(this).addClass('checked');
                }
                else {
                    self.codearea.setOption('mode', 'python');
                    $(this).removeClass('checked');
                }
            });

            $('#showHistoryButton').click(function () {
                self.openHistoryPanel();
//                self.clearHistory();
            });
        };

        AppEngineConsoleFix.createCodeArea = function () {
            //Replace textarea with codemirror editor
        
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
                    "Ctrl-Space": "autocomplete",
                    "Tab": betterTab
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
                return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || 'python'), spaceOverlay);
            });

            self.codearea = CodeMirror.fromTextArea(inputarea, codeConfigOptions);

            // one is for localhost, other for AppEngine console
            var submit_button = jQuery('#execute_button').length ? jQuery('#execute_button') : jQuery('#submitbutton') ;
            var form = submit_button.closest('form');

            submit_button.click(function (event)
            {
                //Needed to prevent stale values being submitted in localhost
                self.codearea.save();
            });

            form.submit(function (event) {
                self.saveHistory(self.codearea.getValue());
            });
        };

        $('document').ready(function () {
            //We don't want to run in the output iframe.
            var in_localhost = (window.name === "" && $('iframe').length == 0);
            var in_appspot_console = (window.name === "" && $('iframe[name="output"]').length != 0);
            var in_appengine_console = (window.name === "" && $('iframe').length != 0 && $('iframe[name="output"]').length == 0);

            if (window.name.indexOf('output') === -1 && !in_appengine_console){
                AppEngineConsoleFix.editTable();
                AppEngineConsoleFix.createCodeArea();
            }
        });

        //If we're not in an iframe (i.e page is being viewed from appspot console or localhost)
        if (window.top === window.self) {
            $('.g-doc-1024').css('width', '98%');
            $('#ae-content').css('height', '2000px');
            $('iframe').attr('height', '100%');
            $('#ae-custom-page').css('height', '100%');
        }
//        //If we are in an iframe, (i.e page is being viewed from AppEngine console)
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

