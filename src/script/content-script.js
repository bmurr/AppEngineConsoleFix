import ace from 'brace';
import 'brace/mode/python';
import 'brace/mode/json';
import 'brace/theme/eclipse';
import 'brace/ext/language_tools';

import favicon, * as FaviconJs from 'favicon.js';
import $ from 'jquery';
import moment from 'moment';
import 'font-awesome/css/font-awesome.css';

import {
  fetchFaviconSrc,
  TERMINAL,
  TERMINAL_NOTIFICATION,
  TERMINAL_FRAMES,
  TRANSPARENT_SQUARE48,
} from './favicons.js';

var AppEngineConsoleFix = function () {
  var self = this;
  window.AppEngineConsoleFix = self;

  window.chrome = chrome;
  self.timers = {};
  self.favicons = {};
  self.outputStyles = { whiteSpace: 'pre' };

  self.getInputArea = function () {
    return $('#code')[0] || $('#code_text')[0];
  };

  self.getNamespace = function () {
    var appEngineConsoleElement = $('body #ae-appbar-lrg h1')[0];
    var localConsoleElement = $('body #leftnavc .sidebarHolder h4 a')[0];
    var $element = $(appEngineConsoleElement || localConsoleElement);
    var namespace = $element.text().split(' ')[0].trim();
    return namespace || 'default';
  };

  self.openHistoryPanel = function () {
    var request = {
      action: 'openHistoryPanel',
      namespace: self.namespace,
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
      console.log(
        [
          'AppEngine Console Extension history is using ',
          bytesInUse,
          ' bytes of storage.',
        ].join('')
      );
    });
  };

  self.saveHistory = function (content, namespace) {
    var hostname = window.location.hostname;
    var url = window.location.href;
    var timestamp = new Date().toISOString();

    chrome.storage.local.get(namespace, function (storage) {
      var entry = {
        content: content,
        url: url,
        timestamp: timestamp,
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

  self.clearHistory = function () {
    chrome.storage.local.clear();
  };

  self.startUpdatingExecutionTimer = function () {
    AppEngineConsoleFix.changeFavicon('WORKING');
    self.timers.executionInterval = window.setInterval(() => {
      let timeElapsed = new Date() - self.timers.lastExecutedAt;
      self.timers.timeElapsed = timeElapsed;
      $('.executionDetails .running .elapsed').text(
        `${(self.timers.timeElapsed / 1000).toFixed(1)}s at ${moment(
          self.timers.lastExecutedAt
        ).format('ddd Do MMM YYYY HH:mm:SSZZ')}`
      );
    }, 1000 / 10);
    $('.executionDetails .complete').hide();
    $('.executionDetails .running').show();
  };

  self.updateTimeElapsedLabelInt = function (timeElapsed) {
    $('.executionDetails .complete .elapsed').text(
      `Last run: ${(timeElapsed / 1000).toFixed(1)}s at ${moment(
        self.timers.lastExecutedAt
      ).format('ddd Do MMM YYYY HH:mm:SSZZ')}`
    );
  };

  self.updateTimeElapsedLabelString = function (timeElapsed) {
    $('.executionDetails .complete .elapsed').text(
      `Last run: ${timeElapsed} at ${moment(self.timers.lastExecutedAt).format(
        'ddd Do MMM YYYY HH:mm:SSZZ'
      )}`
    );
  };

  self.stopUpdatingExecutionTimer = function () {
    let focusHandler = () => {
      AppEngineConsoleFix.changeFavicon('BASE');
      window.removeEventListener('focus', focusHandler);
    };
    if (!document.hasFocus()) {
      AppEngineConsoleFix.changeFavicon('NOTIFICATION');
      window.addEventListener('focus', focusHandler);
    } else {
      AppEngineConsoleFix.changeFavicon('BASE');
    }
    window.clearInterval(self.timers.executionInterval);
    let timeElapsed = new Date() - self.timers.lastExecutedAt;
    self.timers.timeElapsed = timeElapsed;
    self.updateTimeElapsedLabelInt(self.timers.timeElapsed);
    $('.executionDetails .complete').show();
    $('.executionDetails .running').hide();
  };

  self.enableExecuteButton = function () {
    $('#execute_button').removeAttr('disabled');
    $('#execute_button').removeClass('disabled');
  };

  self.disableExecuteButton = function () {
    $('#execute_button').attr('disabled', 'disabled');
    $('#execute_button').addClass('disabled');
  };

  self.applyOutputStyles = function () {
    window.setTimeout(function () {
      let outputElem = document.getElementById('output');
      if (outputElem.contentDocument) {
        outputElem = outputElem.contentDocument.getElementById('output');
      }
      for (let [styleName, styleValue] of Object.entries(self.outputStyles)) {
        outputElem.style[styleName] = styleValue;
      }
    }, 100);
  };

  AppEngineConsoleFix.changeFavicon = function (faviconState) {
    // Base icon in general to show console (add to existing)
    // Icon in working state animation
    // Icon in notification state (until checked)

    faviconState = faviconState || 'BASE';

    let drawBaseFavicon = (canvas, imgSrc) =>
      new Promise((resolve, reject) => {
        let img = new Image();
        let context = canvas.getContext('2d');
        img.onload = function () {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          resolve();
        };
        img.src = imgSrc;
      });

    let drawTerminalFrame = (canvas, frameSvg) =>
      new Promise((resolve, reject) => {
        let terminalB64 = btoa(frameSvg);
        let b64Start = 'data:image/svg+xml;base64,';
        let img = new Image();
        let context = canvas.getContext('2d');
        img.onload = function () {
          let terminalY = canvas.height - img.height;
          let terminalX = canvas.width - img.width;
          context.drawImage(img, terminalX, terminalY);
          resolve();
        };
        img.src = b64Start + terminalB64;
      });

    let makeFavicon = (faviconState) =>
      new Promise((resolve, reject) => {
        fetchFaviconSrc(document, window.location.origin).then((faviconUrl) => {
          let baseFavicon =
            faviconUrl === undefined ? TRANSPARENT_SQUARE48 : faviconUrl;

          if (faviconState === 'BASE') {
            let canvas = document.createElement('canvas');
            let faviconB64Frames = [];
            drawBaseFavicon(canvas, baseFavicon)
              .then(() => drawTerminalFrame(canvas, TERMINAL))
              .then(() => {
                faviconB64Frames.push(canvas.toDataURL());
                resolve(faviconB64Frames);
              });
          } else if (faviconState === 'WORKING') {
            let promises = [];
            for (let TERMINAL_FRAME of TERMINAL_FRAMES) {
              promises.push(
                new Promise((resolve, reject) => {
                  let canvas = document.createElement('canvas');
                  let context = canvas.getContext('2d');
                  drawBaseFavicon(canvas, baseFavicon)
                    .then(() => drawTerminalFrame(canvas, TERMINAL_FRAME))
                    .then(() => {
                      resolve(canvas.toDataURL());
                    });
                })
              );
            }
            Promise.all(promises).then((faviconB64Frames) =>
              resolve(faviconB64Frames)
            );
          } else if (faviconState === 'NOTIFICATION') {
            let canvas = document.createElement('canvas');
            let faviconB64Frames = [];
            drawBaseFavicon(canvas, baseFavicon)
              .then(() => drawTerminalFrame(canvas, TERMINAL_NOTIFICATION))
              .then(() => {
                faviconB64Frames.push(canvas.toDataURL());
                resolve(faviconB64Frames);
              });
          } else {
            throw new Error(`Unrecognized favicon state: ${faviconState}`);
          }
        });
      });

    let getFavicon = (faviconState) =>
      new Promise((resolve, reject) => {
        let favicon = self.favicons[faviconState];
        if (favicon) {
          resolve(favicon);
        } else {
          makeFavicon(faviconState).then((result) => {
            self.favicons[faviconState] = result;
            resolve(result);
          });
        }
      });

    // FaviconJs.defaultPause = 100;
    getFavicon(faviconState).then((faviconB64Frames) => {
      FaviconJs.animate(faviconB64Frames, 100);
    });
  };

  AppEngineConsoleFix.editTable = function () {
    var inputarea = self.getInputArea();
    //Make the textareas rows instead of columns.
    $('#console tbody').prepend($('#code').parent());
    $('#code').parent().wrap('<tr>');

    //Move the 'Run Program' button to the top
    $('#submitbutton')
      .closest('tr')
      .detach()
      .insertAfter($('#console tr:first'));

    //Remove footer
    $('#ft').remove();

    //Give output box more room.
    $('#output').css('height', '1000px');

    //Add controls
    var template = [
      '<div id="menu-bar">',
      '    <div class="controls">',
      '        <div style="float:left"><button type="button" id="showWhitespaceButton" title="Show Whitespace"><i class="fa fa-eye"></i></a></div>',
      '        <div><button type="button" id="showHistoryButton" title="Show History"><i class="fa fa-history"></i></a></div>',
      '    </div>',
      '    <div class="namespace">',
      `       ${self.namespace}`,
      '    </div>',
      '</div>',
    ];

    $(template.join('')).insertBefore($(inputarea));

    $('#showWhitespaceButton').click(function () {
      var checked = !$(this).hasClass('checked');

      if (checked) {
        self.codearea.setOption('showInvisibles', true);
        $(this).addClass('checked');
      } else {
        self.codearea.setOption('showInvisibles', false);
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

    if (self.in_localhost) {
      fetch('http://localhost:8000/templates/console.js').then((response) => {
        response.text().then((scriptText) => {
          let xsrfRegex = RegExp(
            /('|")xsrf_token\1\s*:\s*('|")(?<XSRF>\w+)\2/gm
          );
          self.localXSRFToken = xsrfRegex.exec(scriptText).groups.XSRF;
        });
      });
    }

    var textarea = $(self.getInputArea());

    var editDiv = $('<div>', {
      position: 'absolute',
      width: '100%',
      height: textarea.height(),
      class: 'codearea',
    })
      .css('min-height', `${textarea.height()}px`)
      .insertBefore(textarea);

    var editor = ace.edit(editDiv[0]);
    self.codearea = editor;

    var heightUpdateFunction = function () {
      // http://stackoverflow.com/questions/11584061/
      var newHeight =
        editor.getSession().getScreenLength() * editor.renderer.lineHeight +
        editor.renderer.scrollBar.getWidth();

      var minHeight = $(editDiv[0]).css('min-height');
      if (parseInt(minHeight) < newHeight) {
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

    editor.setOptions({
      enableBasicAutocompletion: true, // Ctrl-Space toggles the menu
      enableLiveAutocompletion: true, // Always gives autocompletion
      showLineNumbers: true,
    });

    // Whenever a change happens inside the ACE editor, update
    // the size again
    editor.getSession().on('change', heightUpdateFunction);

    // // one is for localhost, other for AppEngine console
    var submit_button = $('#execute_button').length
      ? $('#execute_button')
      : $('#submitbutton');

    submit_button.wrap('<div class="executionRow"></div>');
    $(
      `<div class="executionDetails">
        <div class="running hide">
          <i class="fa fa-spinner fa-spin"></i>
          <span class="elapsed"></span>
        </div>
        <div class="complete">
          <span class="elapsed"></span>
        </div>
      </div>`
    ).insertAfter(submit_button);

    $('.executionRow').append(
      `
      <div class="controls">
        <label>Word-wrap
            <input type="checkbox" name="wrap-output" />
        </label>
      </div>
      `
    );

    $('.executionRow .controls input[name="wrap-output"]').change(function () {
      if (this.checked) {
        self.outputStyles['whiteSpace'] = 'pre-wrap';
        self.applyOutputStyles();
      } else {
        self.outputStyles['whiteSpace'] = 'pre';
        self.applyOutputStyles();
      }
    });

    var form = submit_button.closest('form');

    //Needed to prevent stale values being submitted in localhost
    submit_button.click(function (event) {
      textarea.val(editor.getSession().getValue());
    });

    form.submit(function (event) {
      self.saveHistory(self.codearea.getValue(), self.namespace);
      function codeSubmit() {
        $('#output').text('...');
        self.disableExecuteButton();

        var data = {};
        var executionURL = '';
        if (self.in_localhost) {
          data = {
            code: $('#code_text').val(),
            module_name: $('#module_name').val(),
            xsrf_token: self.localXSRFToken,
          };
          executionURL = window.location.href;
        } else if (self.in_appspot_console) {
          data = {
            code: $('#code').val(),
            xsrf_token: form.find('input[name="xsrf_token"]').attr('value'),
          };
          executionURL = window.location.href + '/execute';
        }

        self.timers.lastExecutedAt = new Date();
        self.startUpdatingExecutionTimer();
        var request = $.ajax({
          url: executionURL,
          type: 'POST',
          data: data,
        })
          .done(function (data, textStatus, jqXHR) {
            if (self.in_localhost) {
              $('#output').text(data);
            } else if (self.in_appspot_console) {
              $('#output').attr('srcdoc', data);
              let serverElapsedTimeHeader = jqXHR.getResponseHeader(
                'x-appengine-resource-usage'
              );
              let timeElapsedMatch = serverElapsedTimeHeader.match(/^ms=(\d+)/);
              if (timeElapsedMatch) {
                let timeElapsed = timeElapsedMatch[1];
                let timeElapsedInt = parseInt(timeElapsed, 10);
                self.updateTimeElapsedLabelString(
                  `${(timeElapsedInt / 1000).toFixed(1)}s (${timeElapsed}ms)`
                );
              }
            }

            self.enableExecuteButton();
          })
          .fail(function (xhr, textStatus, errorThrown) {
            if (self.in_localhost) {
              $('#output').text('Request failed');
            } else if (self.in_appspot_console) {
              $('#output').attr('srcdoc', data);
            }
            self.enableExecuteButton();
          })
          .always(function () {
            self.applyOutputStyles();
            self.stopUpdatingExecutionTimer();
          });
        return false;
      }

      codeSubmit();

      event.preventDefault();
      event.stopPropagation();
    });

    // form.unbind();
  };

  self.namespace = self.getNamespace();

  $('document').ready(function () {
    function inIframe() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    }

    //We don't want to run in the output iframe.
    self.in_localhost = !inIframe() && window.location.hostname === 'localhost';
    self.in_appspot_console =
      !inIframe() && window.location.hostname.endsWith('.appspot.com');
    self.in_appengine_console =
      !inIframe() && window.location.hostname === 'appengine.google.com';

    if (self.in_localhost) {
      var elt = document.createElement('script');
      elt.setAttribute(
        'src',
        'chrome-extension://lickplgkkppdanbcigejmkconmpcmien/script/inline-script.js'
      );
      document.head.appendChild(elt);
    }

    if (window.name.indexOf('output') === -1 && !self.in_appengine_console) {
      AppEngineConsoleFix.changeFavicon();
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
};

module.exports = new AppEngineConsoleFix();
