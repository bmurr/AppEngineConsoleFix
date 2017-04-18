require('styles/style.scss');
const CodeMirror = require('codemirror');
require('codemirror/addon/mode/overlay');
require('codemirror/keymap/sublime');
require('codemirror/mode/python/python');

import Immutable from 'immutable';

import React from 'react';
import ReactDOM from 'react-dom';

import Grid from './Grid';
import {humanizeTimestamp, prettifyBytes} from './utils';

class CodeArea extends React.Component {

  constructor(props) {
    super(props);
    this.defaultCodeMirrorOptions = {
      "mode": "python",
      "theme": "default",
      "indentUnit": 4,
      "keyMap": "sublime",
      "lineNumbers": true,
      "readOnly": true,
      "gutter": true,
      "fixedGutter": false,
      "flattenSpans": false,
      "extraKeys": {
        "Ctrl-Space": "autocomplete"
      },
      "matchBrackets": true,
      "dragDrop": false,
      "viewportMargin": Infinity
    };
    this.getValue = this.getValue.bind(this);
    this.setValue = this.setValue.bind(this);    
    this.setOptions = this.setOptions.bind(this);
  }

  getValue(){
    return this.codemirror.getValue();
  }

  setValue(value) {
    if (value) {
      this.codemirror.setValue(value);
    }
  }  

  setOptions(options) {
    Object.keys(options).map((key, index) => {
      this.codemirror.setOption(key, options[key]);
    });
  }

  componentDidMount() {
    let options = Object.assign({}, this.defaultCodeMirrorOptions);
    options = Object.assign(options, this.props.options);
    this.codemirror = CodeMirror.fromTextArea(this.textarea, options);
    this.setValue(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setValue(nextProps.value);
    }

    if (!Immutable.fromJS(this.props.options).equals(Immutable.fromJS(nextProps.options))){
      this.setOptions(nextProps.options);
    }

  }

  render() {
    return (<textarea ref={(textarea) => {
      this.textarea = textarea;
    }}></textarea>)
  }
}

class ImportExportPanel extends React.Component {

  constructor(props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleUpdate() {    
    this.props.updateHandler(this.codearea.getValue())
  }

  render () {
    return (
      <Panel className="import-export-panel">
        <CodeArea value={this.props.value} options={this.props.options} ref={(codearea) => {
          this.codearea = codearea;
        }}/>
        <div className="controls">
          <button className="button-danger" onClick={this.handleUpdate}>Update local storage.</button>
        </div>
      </Panel>
    )
  }
}


class ContainerHeader extends React.Component {
  render() {
    return null;
    return (<div className="header">HEADER</div>)
  }
}

class ContainerFloatingBar extends React.Component {
  render() {
    return null;
    return (<div className="floating-bar">FLOATING BAR</div>)
  }
}

class PanelContainer extends React.Component {
  render() {
    return (
      <div className="panel-container">
        {this.props.children}
      </div>)
  }
}

class Panel extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.isVisible === false) {
      return null;
    }

    const className = ['panel', this.props.className].join(' ');

    return (
      <div className={className}>
        {this.props.children}
      </div>)
  }
}


class ContainerFooter extends React.Component {
  render() {
    if (!this.props.data) {
      return null;
    }

    return (<div className="footer">
      <div className="footer-content">
        <div className="footer-component">{this.props.data.logCount} records | {this.props.data.usage}</div>
        <div className="footer-component">
          <button onClick={this.props.toggleImportExportPanel}>Import/Export</button>
          <b>NAMESPACE</b>
        </div>
      </div>
    </div>)
  }
}

class HistoryPanel extends React.Component {
  constructor(props) {
    super(props);
    
    this.getInitialState = this.getInitialState.bind(this);
    this.handleHistoryItemSelected = this.handleHistoryItemSelected.bind(this);
    this.toggleImportExportPanel = this.toggleImportExportPanel.bind(this);
    
    this.getLocalStorage = this.getLocalStorage.bind(this);
    this.setLocalStorage = this.setLocalStorage.bind(this);

    this.codeAreaOptions = {};
    this.importExportCodeAreaOptions = {
      readOnly: false,
      mode: {
        name: 'javascript', 
        json: true
      }
    }

    this.state = this.getInitialState();
  }

  setLocalStorage (serializedStorage) {
    if (window.confirm('Are you sure you want to modify the localStorage?')){
      const storage = JSON.parse(serializedStorage);
      chrome.storage.local.set(storage);
      this.getLocalStorage();  
    }    
  }

  getLocalStorage () {
    const storagePromise = new Promise(function (resolve, reject) {
      chrome.storage.local.get(null, function (storageObject) {
        resolve(storageObject);
      });
    });

    const usagePromise = new Promise(function (resolve, reject) {
      chrome.storage.local.getBytesInUse(null, function (bytesInUse) {
        resolve(bytesInUse);
      });
    });

    Promise.all([usagePromise, storagePromise]).then((values) => {
      const bytesInUse = values[0];
      const storageObject = values[1];
      const historyObject = Object.assign({}, storageObject.history);

      const summary = {
        logCount: Object.keys(historyObject).length,
        usage: prettifyBytes(bytesInUse)
      };

      let history = [];
      Object.keys(historyObject).map(function (key, index) {
        let value = Object.assign({}, historyObject[key]);
        value.humanizedTimestamp = humanizeTimestamp(value.timestamp);
        value.location = value.url.indexOf('localhost') !== -1 ? 'localhost' : 'appengine';
        value.contentLength = value.content.length;
        history.push(value);
      })

      history.reverse();

      const headers = ["Timestamp", "URL", "Location", "Size", "Content"];
      const headerKeys = ['humanizedTimestamp', 'url', 'location', 'contentLength', 'content'];
      const rows = history.slice(0, 500);

      // const headers = ["Timestamp"];
      // const headerKeys = ['humanizedTimestamp'];
      // const rows = history.map((row) => {humanizedTimestamp: row.humanizedTimestamp});      

      const data = {
        headers: headers,
        headerKeys: headerKeys,
        rows: rows
      };

      this.setState({
        storageObject: storageObject,
        data: data,
        summary: summary
      });
    });
  }

  getInitialState () {
    return {
      gridPanelVisible: true,
      codePanelVisible: true,
      codeAreaOptions: {}    
    }
  }

  handleHistoryItemSelected(event, selectRowCallback, rowIndex, columnIndex) {
    if (columnIndex === 0) {
      selectRowCallback(rowIndex);
      this.setState({
        codePanelVisible: true,
        codeAreaValue: this.state.data.rows[rowIndex].content
      })
    }
  }

  toggleImportExportPanel() {
    
    if (this.state.importExportPanelVisible){
      this.setState({
        importExportPanelVisible: false
      })
    } else {
      const serializedStorage = JSON.stringify(this.state.storageObject, null, 2);
      this.setState({
        importExportPanelVisible: true,
        serializedStorage: serializedStorage,      
      });
    }
    
  }

  componentDidMount() {
    this.getLocalStorage();
  }

  render() {
    return (
      <div className="main-container">
        <ContainerHeader/>        
          {this.state.importExportPanelVisible ?            
            (
              <PanelContainer>
                <ImportExportPanel value={this.state.serializedStorage} options={this.importExportCodeAreaOptions} updateHandler={this.setLocalStorage}/>
              </PanelContainer>
            ) :
            (<PanelContainer>
              <Panel className="history-grid-panel" isVisible={this.state.gridPanelVisible}>
                <Grid data={this.state.data} bodyClickHandler={this.handleHistoryItemSelected}/>
              </Panel>
              <Panel className="history-code-panel" isVisible={this.state.codePanelVisible}>
                <a className="close-button">×</a>
                <CodeArea value={this.state.codeAreaValue} options={this.codeAreaOptions}/>
              </Panel>
            </PanelContainer>)
          }
        
        <ContainerFloatingBar/>
        <ContainerFooter data={this.state.summary} toggleImportExportPanel={this.toggleImportExportPanel}/>
      </div>)
  }
}

// Render TableHeaderColumns
// Get their current sizes and min sizes
// TableHeaderColumns pass their sizes to the Table
// Table then updates position of column handles and TableBodyColumns

// When column handles are dragged, update the tableheadercolumns sizes and repeat the above


//Enable React DevTools
window.React = React;

ReactDOM.render(<HistoryPanel/>, document.getElementById("app"));










