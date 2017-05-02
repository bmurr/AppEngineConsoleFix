require('styles/style.scss');

import AceEditor from 'react-ace';
import 'brace/mode/python';
import 'brace/mode/json';
import 'brace/theme/tomorrow';

const Spinner = require('react-spinkit');
import 'react-spinkit/css/cube-grid.css';

import React from 'react';
import ReactDOM from 'react-dom';

import HistoryGrid from './HistoryGrid';
import {prettifyBytes} from './utils';
import moment from 'moment';

class CodeArea extends React.Component {

  constructor(props) {
    super(props);
    this.defaultProps = {
      height:"100%",
      width:"100%",
      readOnly:true,
      fontSize:12,
      mode:"python",
      theme:"tomorrow",        
      name:"ace-editor",
      editorProps:{
        $blockScrolling: true
      }
    }
    
  }

  render() {
    const props = Object.assign({}, this.defaultProps, this.props);

    return (
      <AceEditor {...props}/>)
  }
}

class ImportExportPanel extends React.Component {

  constructor(props) {
    super(props);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.onChange = this.onChange.bind(this);
    this.options = {
      readOnly: false,
      mode: 'json',
      onChange: this.onChange
    }

    this.state = {
      value: this.props.value
    }
  }

  handleUpdate() {    
    this.props.updateHandler(this.state.value)
  }

  onChange (newValue) {
    this.setState({
      value: newValue
    })
  }

  render () {
    return (
      <Panel className="import-export-panel">
        <CodeArea value={this.state.value} {...this.options}/>
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
    this.handleCodePanelClose = this.handleCodePanelClose.bind(this);
    this.toggleImportExportPanel = this.toggleImportExportPanel.bind(this);
    
    this.getLocalStorage = this.getLocalStorage.bind(this);
    this.setLocalStorage = this.setLocalStorage.bind(this);

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
        value.humanizedTimestamp = moment(value.timestamp).fromNow();
        value.prettyTimestamp = moment(value.timestamp).format("D MMMM YYYY HH:mm");
        value.location = value.url.indexOf('localhost') !== -1 ? 'localhost' : 'appengine';
        value.contentLength = value.content.length;
        history.push(value);
      })

      history.reverse();

      const headers = [
        {key: 'humanizedTimestamp', title: 'Timestamp'},
        {key: 'url', title: 'URL'},
        {key: 'location', title: 'Location'},
        {key: 'contentLength', title: 'Size'},
        {key: 'content', title: 'Content'},
      ]

      const data = {
        headers: headers,
        rows: history
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
      codePanelVisible: false
    }
  }

  handleHistoryItemSelected({index, rowData}) {
    
    const newData = Object.assign({}, this.state.data);
    newData.headers = [{key:'humanizedTimestamp', title:'Timestamp'}];
    this.setState({
      codePanelVisible: true,
      codeAreaValue: rowData.content,
      data: newData
    })
  }

  handleCodePanelClose(){
    const newData = Object.assign({}, this.state.data);
    newData.headers = [
      {key: 'humanizedTimestamp', title: 'Timestamp'},
      {key: 'url', title: 'URL'},
      {key: 'location', title: 'Location'},
      {key: 'contentLength', title: 'Size'},
      {key: 'content', title: 'Content'},
    ];
    this.setState({
      codePanelVisible: false,
      data: newData
    })
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
                <ImportExportPanel value={this.state.serializedStorage} updateHandler={this.setLocalStorage}/>
              </PanelContainer>
            ) :
            (<PanelContainer>
              <Panel className="history-grid-panel" isVisible={this.state.gridPanelVisible}>
              { 
                this.state.data ?
                (<HistoryGrid data={this.state.data} itemSelectedHandler={this.handleHistoryItemSelected}/>) :
                <div className="loader-container">
                  <Spinner spinnerName='wave' noFadeIn></Spinner>
                </div>
              }
              </Panel>
              <Panel className="history-code-panel" isVisible={this.state.codePanelVisible}>
                <a className="close-button" onClick={this.handleCodePanelClose}>×</a>
                <CodeArea value={this.state.codeAreaValue}/>
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










