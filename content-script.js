//If we're not in an iframe (i.e page is being viewed from application admin panel)
if (top === self) { 
    $('.g-doc-1024').css('width','98%');
    $('#ae-content').css('height','2000px');
    $('iframe').attr('height','100%');
} 
//If we are in an iframe, (i.e page is being viewed from main GAE admin panel)
else { 
    //Remove the left hand nav bar and reset margin
    $('#ae-lhs-nav').remove();
    $('#ae-content').css('margin', '0px');
    $('#ae-content').css('border-left', '0px');
    $('#ae-content').css('padding-left', '0px');
}
var codearea = null;
function editTable(){
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
    
    //Remove padding on header
    $('#ae-content h3').css('padding', '0px');

    //Add checkbox toggles
    $('<div id="controls" style="float:left"></div>').insertAfter($('#ae-content h3'));
    var checkbox1 = '<span><input type="checkbox" id="wspaceBox"><label for="wspaceBox">Show whitespace</label></span>';
    //var checkbox2 = '<span><input type="checkbox" value="Car"></span>';
    $('#controls').append(checkbox1);
    //$('#controls').append(checkbox2);
    $('#wspaceBox').click(function(){ 
        var checked = $(this).is(':checked');
        if (checked){
            console.log('checked');
            codearea.setOption('mode','pythonWS');
        }
        else{
            console.log('unchecked');
            codearea.setOption('mode','python');
        }
     });
}

function createCodeArea(){
    //Give console table a fontsize setting, because the new code area inherits fontsize settings from it
    $('#console').css('font-size', '10pt');

    //Replace textarea with codemirror editor
    var inputarea = $('#code')[0];
    var codeConfigOptions = {
        // value (string)
        "mode": "python",
        "theme": "default",
        "indentUnit":4,
        // smartIndent (boolean)
        // tabSize (integer)
        // indentWithTabs (boolean)
        // electricChars (boolean)
        // autoClearEmptyLines (boolean)
        // keyMap (string)
        // extraKeys (object)
        // lineWrapping (boolean)
        "lineNumbers":true,
        // firstLineNumber (integer)
        // lineNumberFormatter (function(integer))
        "gutter":true,
        "fixedGutter":true,
        // readOnly (boolean)
        // onChange (function)
        // onCursorActivity (function)
        // onViewportChange (function)
        // onGutterClick (function)
        // onScroll (function)
        // onUpdate (function)
        "matchBrackets":true,
        // cursorBlinkRate (number)
        // pollInterval (number)
        // undoDepth (integer)
        // tabindex (integer)
        // autofocus (boolean)
        "dragDrop":false
        // onDragEvent (function)
        // onKeyEvent (function)
    }
    CodeMirror.defineMode("pythonWS", function(config, parserConfig) {
  var spaceOverlay = {
        token: function(stream, state) {
            console.log(stream.string);
            var ch;
            while ((ch = stream.next()) != null) {
                if (ch == ' '){
                    return 'tab';
                }
                return null;
            }
        }
      };
      return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || "python"), spaceOverlay);
    });
    codearea = CodeMirror.fromTextArea(inputarea, codeConfigOptions);

    //Border around codemirror textarea
    $('.CodeMirror').css('border', '1px solid #C9C9C9');
}

editTable();
createCodeArea();