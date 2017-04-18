import React from 'react';
import {debounce} from './utils';

class ClickableGridCell extends React.Component {

  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }  

  handleClick(event){
    this.props.handleClick(event, this.props.rowIndex, this.props.columnIndex);
  }

  render() {
    return (<div className="grid-column" onClick={this.handleClick}>
              <div className="grid-cell">{this.props.children}</div>
            </div>)
  }
}

class GridRow extends React.Component {

  render () {
    const {
      children,
      columns,
      handleClick,
      rowIndex,
      selectedRowIndex
    } = this.props;

    const cells = columns.map((column, index) => {
      return (<ClickableGridCell key={index} rowIndex={rowIndex} columnIndex={index} handleClick={handleClick}>
                {column}
              </ClickableGridCell>)
    });

    const classNames = {
      'grid-row': true,
      'selected': selectedRowIndex === rowIndex
    };
    const className = Object.keys(classNames).filter((key) => classNames[key]).join(' ');

    return (
      <div className={className}>
        {cells}      
      </div>);
  }
}

class GridBody extends React.Component {

  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = debounce(this.handleKeyPress, 100);
    this.handleKeyPress = this.handleKeyPress.bind(this);    
    this.setSelectedRow = this.setSelectedRow.bind(this);


    this.state = {};
  }

  setSelectedRow(rowIndex){
    this.setState({
      selectedRowIndex:rowIndex
    });
  }

  handleClick (event, rowIndex, ...args) {    
    this.props.bodyClickHandler(event, this.setSelectedRow, rowIndex, ...args);
  }

  handleKeyPress(event) {
    console.log('handleKP');
    if (!this.state.selectedRowIndex){
      return;
    }

    if (event.key === 'ArrowUp') {
      const newSelectedRowIndex = Math.max(this.state.selectedRowIndex - 1, 0);
      this.setSelectedRow(newSelectedRowIndex);
    } else if (event.key === 'ArrowDown') {
      const newSelectedRowIndex = Math.min(this.state.selectedRowIndex + 1, this.props.data.rows.length);
      this.setSelectedRow(newSelectedRowIndex);
    }

    event.preventDefault();
    event.stopPropagation();
  }  

  render () {
    const {
      children,
      data
    } = this.props;
    
    const rows = data.rows.map((rowObject, index) => {
      let row = data.headerKeys.map((headerKey, index) => rowObject[headerKey]);
      return <GridRow columns={row} key={index} rowIndex={index} selectedRowIndex={this.state.selectedRowIndex} handleClick={this.handleClick}/>
    });

    
    return (
      <div tabIndex="0" className="grid-body" onKeyDown={this.handleKeyPress}>
        {rows}           
      </div>)
  }
}

class Grid extends React.Component {

    render () {
      if (!this.props.data){
        return null;
      }

      return (
        <div className="grid">
          <div className="grid-header">
            <GridRow columns={this.props.data.headers}/>
          </div>          
          <GridBody data={this.props.data} bodyClickHandler={this.props.bodyClickHandler} />
        </div>)
    }
}

export default Grid;
