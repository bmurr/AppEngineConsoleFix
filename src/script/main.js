import 'react-devtools'

require('styles/style.scss');

import React from 'react';
import ReactDOM from 'react-dom';

import HistoryPanel from './components/HistoryPanel';

// Render TableHeaderColumns
// Get their current sizes and min sizes
// TableHeaderColumns pass their sizes to the Table
// Table then updates position of column handles and TableBodyColumns

// When column handles are dragged, update the tableheadercolumns sizes and repeat the above


//Enable React DevTools
window.React = React;

//Wait for config message from our event page before doing anything.
chrome.runtime.onMessage.addListener(function intializer(request, sender, sendResponse) {
  if (request && request.config !== undefined) {
    ReactDOM.render(<HistoryPanel config={request.config}/>, document.getElementById("app"));      
  }
  chrome.runtime.onMessage.removeListener(intializer);
});















