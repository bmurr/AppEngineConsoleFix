import ace from 'brace';
import 'brace/mode/python';
import 'brace/mode/json';
import 'brace/theme/eclipse';

import $ from 'jquery';

var AppEngineConsoleFix = function () {
  var self = this;
  window.AppEngineConsoleFix = self;
  window.chrome = chrome;

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

  self.getNamespace = function() {
    var appEngineConsoleElement = $('body #ae-appbar-lrg h1')[0];
    var localConsoleElement = $('body #leftnavc .sidebarHolder h4 a')[0];
    var $element = $(appEngineConsoleElement || localConsoleElement);
    var namespace = $element.text().split(' ')[0].trim();
    return namespace || 'default';
  }

  self.openHistoryPanel = function(){
      var request = {
          action: 'openHistoryPanel',
          namespace: self.namespace
      };
      chrome.runtime.sendMessage(request);
  };

  self.loadHistory = function (namespace) {
      self.getHistoryUsage();
      chrome.storage.local.get(namespace, function (history_object) {
          console.log(history_object);
      });
  };

  self.getHistoryUsage = function () {
      chrome.storage.local.getBytesInUse(null, function (bytesInUse) {
          console.log(['AppEngine Console Extension history is using ', bytesInUse, ' bytes of storage.'].join(''));
      });
  };

  self.saveHistory = function (content, namespace) {
      var hostname = window.location.hostname;
      var url = window.location.href;
      var timestamp = (new Date()).toISOString();

      chrome.storage.local.get(namespace, function (storage) {
          var entry = {
              content: content,
              url: url,
              timestamp: timestamp
          };

          if (!$.isEmptyObject(storage)) {
              storage[namespace][timestamp] = entry;
          } else {
              storage[namespace] = {};
              storage[namespace][timestamp] = entry;
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
      var template = ['<div id="menu-bar">',
                      '    <div class="controls">',
                      '        <div style="float:left"><a href="javascript:void(0)" id="showWhitespaceButton" title="Show Whitespace"><i class="ion-ios-eye-outline"></i></a></div>',
                      '        <div><a href="javascript:void(0)" id="showHistoryButton" title="Show History"><i class="ion-clock"></i></a></div>',
                      '    </div>',
                      '    <div class="namespace">',
                      `       ${self.namespace}`,
                      '    </div>',                      
                      '</div>'];

      $(template.join('')).insertBefore($(inputarea));

      $('#showWhitespaceButton').click(function () {
          var checked = !($(this).hasClass('checked'));

          if (checked) {
              self.codearea.setOption("showInvisibles", true);
              $(this).addClass('checked');
          }
          else {
              self.codearea.setOption("showInvisibles", false);
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

    var textarea = $(self.getInputArea());

    var editDiv = $('<div>', {
        position: 'absolute',
        width: "100%",
        height: textarea.height(),        
        'class': 'codearea'
    }).css('min-height', `${textarea.height()}px`).insertBefore(textarea);

    var editor = ace.edit(editDiv[0]);
    self.codearea = editor;

    var heightUpdateFunction = function() {

      // http://stackoverflow.com/questions/11584061/
      var newHeight =
                editor.getSession().getScreenLength()
                * editor.renderer.lineHeight
                + editor.renderer.scrollBar.getWidth();

      var minHeight = $(editDiv[0]).css('min-height');
      if (parseInt(minHeight) < newHeight){
        $(editDiv[0]).height(`${newHeight.toString()}px`);  
      } else {
        $(editDiv[0]).height(minHeight);
      }
      

      // This call is required for the editor to fix all of
      // its inner structure for adapting to a change in size
      editor.resize();
    };

    textarea.hide();

    editor.getSession().setValue(textarea.val());
    editor.getSession().setMode('ace/mode/python');
    editor.setTheme('ace/theme/eclipse');

    // Whenever a change happens inside the ACE editor, update
    // the size again
    editor.getSession().on('change', heightUpdateFunction);
    
    
    // // one is for localhost, other for AppEngine console
    var submit_button = $('#execute_button').length ? $('#execute_button') : $('#submitbutton') ;
    var form = submit_button.closest('form');

    //Needed to prevent stale values being submitted in localhost
    submit_button.click(function (event)
    {       
        textarea.val(editor.getSession().getValue());
    });

    // form.submit(function (event) {
    //   self.saveHistory(self.codearea.getValue(), self.namespace);    
    // });
  };

  self.namespace = self.getNamespace();

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



}

module.exports =  new AppEngineConsoleFix();
