import React from 'react';
import ReactDOM from 'react-dom';
// import Draggable from 'react-draggable';
// import sizeMe from 'react-sizeme';

//http://codepen.io/anon/pen/aBZeRY?editors=1001
require('styles/style.scss');

class TableColumn extends React.Component {
    render () {
        const columnStyle = {
            maxWidth: this.props.headerColumnSize,
            minWidth: this.props.headerColumnSize
        }; 
        return (
            <div className="table-column" style={columnStyle}>
                {this.props.text}
            </div>);
    }
}

class TableHeaderColumn extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            style: {flex: "0 1 auto"}
        }
    }

    componentDidMount() {
        const minBoundingClientRect = this.refs.tableHeaderColumn.getBoundingClientRect();
        this.setState({
            style: {}
        }, () => this.props.initTableHeaderSizes(this.props.index, minBoundingClientRect, this.refs.tableHeaderColumn.getBoundingClientRect()));
    }

    render () {
         return (
            <div className="table-column" ref="tableHeaderColumn" style={this.state.style}>
                {this.props.text}
            </div>);
    }
}

class TableRow extends React.Component {
    render () {
        const columns = [];
        this.props.row.forEach((text, index) => {
            columns.push(<TableColumn text={text} key={index} headerColumnSize={this.props.headerColumnSizes[index]}/>);
        });
        return (
            <div className="table-row">
                {columns}
            </div>);
    }
}

class TableHeaderRow extends React.Component {
    render () {
        return (
            <div className="table-row">
                {this.props.components}
            </div>
        );
    }
}

class TableHeader extends React.Component {
    render () {
        return (
            <div className="table-header">
                <TableHeaderRow components={this.props.headerComponents}/>
            </div>);
    }
}

class TableBody extends React.Component {
    render () {
        const rows = [];
        this.props.rows.forEach((row, index) => {
            rows.push(<TableRow row={row} key={index} headerColumnSizes={this.props.headerColumnSizes}/>);
        });
        return (
            <div className="table-body">
                {rows}
            </div>);
    }
}

class TableColumnHandle extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            width: "0px"
        }
    }

    componentDidMount() {
        this.setState({
            width: this.refs.tableColumnHandle.getBoundingClientRect().width
        });
    }

    render () {
        return (<div className="table-column-resize-handle" style={{left: this.props.left - this.state.width / 2}} ref="tableColumnHandle"></div>);
    }
}

class Table extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            handlePositions: Array(this.props.table.headers.length - 1).fill(0),
            headerColumnSizes: Array(this.props.table.headers.length).fill("auto"),
            headerColumnMinSizes: Array(this.props.table.headers.length).fill("auto")
        };
    }

    onColumnHandleDrag(e, coreData){
        window.console.log(e, coreData);
    }

    componentDidMount() {
        window.console.log("Table component mounted");
        window.console.log(this);
        window.console.log(this.headerComponents);
    }

    initTableHeaderSizes (index, minBoundingClientRect, boundingClientRect) {
        window.console.log(index, minBoundingClientRect, boundingClientRect);        
        
        const handlePositions = this.state.handlePositions;
        const headerColumnSizes = this.state.headerColumnSizes;
        const headerColumnMinSizes = this.state.headerColumnMinSizes;
        
        handlePositions[index] = boundingClientRect.right;
        headerColumnSizes[index] = boundingClientRect.width;
        headerColumnMinSizes[index] = minBoundingClientRect.width;
        
        this.setState({
            handlePositions: handlePositions,
            headerColumnSizes: headerColumnSizes,
            headerColumnMinSizes: headerColumnMinSizes
        });        
    }

    onTableHeaderSizeChange (index, minBoundingClientRect, boundingClientRect) {
        window.console.log(index, minBoundingClientRect, boundingClientRect);        
        
        const handlePositions = this.state.handlePositions;
        const headerColumnSizes = this.state.headerColumnSizes;
        const headerColumnMinSizes = this.state.headerColumnMinSizes;
        
        handlePositions[index] = boundingClientRect.right;
        headerColumnSizes[index] = boundingClientRect.width;
        headerColumnMinSizes[index] = minBoundingClientRect.width;
        
        this.setState({
            handlePositions: handlePositions,
            headerColumnSizes: headerColumnSizes,
            headerColumnMinSizes: headerColumnMinSizes
        });
    }

    render () {
        const headerComponents = [];
        const handleComponents = [];

        this.props.table.headers.forEach((text, index) => {
            headerComponents.push(<TableHeaderColumn text={text} headerColumnMinSizes={this.headerColumnMinSizes} headerColumnSizes={this.headerColumnSizes} initTableHeaderSizes={this.initTableHeaderSizes.bind(this)} index={index} key={index}/>);
        });

        return (
            <div className="table">
                <TableHeader headerComponents={headerComponents}/>
                <TableBody rows={this.props.table.rows} headerColumnSizes={this.state.headerColumnSizes}/>
                {handleComponents}
            </div>)
    }
}


class PanelColumn extends React.Component {
    render () {
        return (<div className="panel-column">{this.props.children}</div>)
    }
} 

class PanelBody extends React.Component {
    render () {
        return (
            <div className="panel-body">
                <PanelColumn>
                    <Table table={this.props.table} />
                </PanelColumn>
                <PanelColumn/>
            </div>)
    }
}

class PanelFooter extends React.Component {
    render () {
        return (<div className="panel-footer"></div>)
    }
}

class HistoryPanel extends React.Component {
    render () {
        return (
            <div className="history-panel">
                <PanelBody table={this.props.table} />
                <PanelFooter/>
            </div>)
    }
}

// Render TableHeaderColumns
// Get their current sizes and min sizes
// TableHeaderColumns pass their sizes to the Table
// Table then updates position of column handles and TableBodyColumns

// When column handles are dragged, update the tableheadercolumns sizes and repeat the above


const headers = ["Timestamp", "URL", "Location", "Size", "Content"];
const rows = Array(100).fill(Array(5).fill().map((_, i) => `Content-${i}`))
const myTable = {headers: headers, rows: rows};

ReactDOM.render(<HistoryPanel table={myTable} />, document.getElementById("app"));










