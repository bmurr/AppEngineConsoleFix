import React from 'react';

import Spinner from 'react-spinkit';
import 'react-spinkit/css/cube-grid.css';

import moment from 'moment';

import CodeArea from './CodeArea';
import ContainerHeader from './ContainerHeader';
import ContainerFooter from './ContainerFooter';
import ImportExportPanel from './ImportExportPanel';
import HistoryGrid from './HistoryGrid';
import Panel from './Panel';
import PanelContainer from './PanelContainer';
import SearchBar from './SearchBar';

import DataTable from '../DataTable';


class HistoryPanel extends React.Component {
  constructor(props) {
    super(props);
    
    this.getInitialState = this.getInitialState.bind(this);
    this.handleHistoryItemSelected = this.handleHistoryItemSelected.bind(this);
    this.handleCodePanelClose = this.handleCodePanelClose.bind(this);
    this.toggleImportExportPanel = this.toggleImportExportPanel.bind(this);
    this.toggleSearchBar = this.toggleSearchBar.bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSearchCommand = this.handleSearchCommand.bind(this);
    
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
    const storagePromise = new Promise((resolve, reject) => {
      chrome.storage.local.get(null, function (storageObject) {
        resolve(storageObject);
      });
    });

    const usagePromise = new Promise((resolve, reject) => {
      chrome.storage.local.getBytesInUse(null, function (bytesInUse) {
        resolve(bytesInUse);
      });
    });

    Promise.all([usagePromise, storagePromise]).then((values) => {
      const bytesInUse = values[0];
      const storageObject = values[1];
      const historyObject = Object.assign({}, storageObject[this.state.namespace]);

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

      const dataTable = new DataTable(history, headers, bytesInUse);

      this.setState({
        storageObject: storageObject,
        dataTable: dataTable        
      });
    });
  }

  getInitialState () {
    return {
      gridPanelVisible: true,
      codePanelVisible: false,
      namespace: this.props.config.namespace
    }
  }

  handleHistoryItemSelected({index, rowData}) {    
    this.state.dataTable.setHeaderKeys(['humanizedTimestamp']);
    this.setState({
      codePanelVisible: true,
      codeAreaValue: rowData.content,
    })
  }

  handleCodePanelClose(){
    this.state.dataTable.resetHeaderKeys();
    this.setState({
      codePanelVisible: false,
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
    // document.addEventListener("keydown", this.handleKeyDown, false);
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
      event.stopPropagation();
    }, false);
    this.getLocalStorage();
  }

  componentWillUnmount(){
    // document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  toggleSearchBar(){
    if (this.state.searchBarVisible){
      this.state.dataTable.clearRowFilter();

      this.setState({
        searchBarVisible: false        
      })
    } else {
      this.setState({
        searchBarVisible: true
      })

    }
  }

  handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'i'){
      this.toggleSearchBar()
      event.stopPropagation();
    }    
  }

  handleSearchCommand(searchText){
    console.log('Searching for ' + searchText);
    const newRows = [];

    function searchFilter(searchText, row){
      return row.content.indexOf(searchText) !== -1;
    }

    this.state.dataTable.setRowFilter(searchFilter.bind(null, searchText))
    this.forceUpdate();
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
                this.state.dataTable ?
                (<HistoryGrid dataTable={this.state.dataTable} itemSelectedHandler={this.handleHistoryItemSelected}/>) :
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
        
        {this.state.searchBarVisible ?
          (
            <SearchBar ref={(searchBar) => this.searchBar = searchBar} searchHandler={this.handleSearchCommand}/>
          ) : null
        }

        <ContainerFooter dataTable={this.state.dataTable} namespace={this.state.namespace} toggleImportExportPanel={this.toggleImportExportPanel}/>
      </div>)
  }
}

export default HistoryPanel;
