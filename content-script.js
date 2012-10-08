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

//Make the textareas rows instead of columns.
$('#console tbody').prepend($('#code').parent());
$('#code').parent().wrap('<tr>');

//Insert a blank row to put space between the areas
$('#console tr:first').after('<tr style="height:30px"><td></td></tr>');

//Remove footer
$('#ft').remove();

//Give console table a fontsize setting, because the new code area inherits fontsize settings from it
$('#console').css('font-size', '10pt');

//Replace textarea with codemirror editor
var codearea = $('#code')[0];
var codeConfigOptions = {
    "dragDrop":false,
    "fixedGutter":true,
    "gutter":true,
    "indentUnit":4,
    "lineNumbers":true,
    "matchBrackets":true
};

CodeMirror.fromTextArea(codearea, codeConfigOptions);

//Border around codemirror textarea
$('.CodeMirror').css('border', '1px solid #C9C9C9');

//Make the codearea resizable (not working properly)

// resizeOptions = {
//     handles: "se",
//     maxWidth: $('#console').width(),
//     minWidth: $('#console').width(),
//     minHeight: 200
// }


//$('.CodeMirror').wrap('<div id="codeWrapper">');
//$('#codeWrapper').resizable(resizeOptions);
