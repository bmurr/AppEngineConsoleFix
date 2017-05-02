import React from 'react';
import { ArrowKeyStepper, AutoSizer, Column, Table, defaultCellRenderer } from 'react-virtualized';

function defaultRowRenderer ({
  className,
  columns,
  index,
  isScrolling,
  key,
  onRowClick,
  onRowDoubleClick,
  onRowMouseOver,
  onRowMouseOut,
  rowData,
  style
}) {
  const a11yProps = {}

  if (
    onRowClick ||
    onRowDoubleClick ||
    onRowMouseOver ||
    onRowMouseOut
  ) {
    a11yProps['aria-label'] = 'row'

    if (onRowClick) {
      a11yProps.onClick = (event) => onRowClick({ event, index, rowData })
    }
    if (onRowDoubleClick) {
      a11yProps.onDoubleClick = (event) => onRowDoubleClick({ event, index, rowData })
    }
    if (onRowMouseOut) {
      a11yProps.onMouseOut = (event) => onRowMouseOut({ event, index, rowData })
    }
    if (onRowMouseOver) {
      a11yProps.onMouseOver = (event) => onRowMouseOver({ event, index, rowData })
    }
  }

  return (
    <div
      {...a11yProps}
      className={className}
      key={key}
      role='row'
      style={style}
    >
      {columns}
    </div>
  )
}

function timestampCellRenderer ({
  cellData,
  columnData,
  columnIndex,
  dataKey,
  isScrolling,
  rowData,
  rowIndex
}) {
  if (cellData == null) {
    return ''
  } else {
    return (
      <div>
        <div>{ cellData }</div>
        <div className="timestamp-subrow">{ rowData['prettyTimestamp'] }</div>
      </div>
      )
  }
}


function hookArrowKeyStepper(WrappedComponent) {
  return class Enhancer extends WrappedComponent {
    
    constructor(...params){
      super(...params);
    }

    componentWillUpdate(nextProps, nextState) {
      if (this.state.scrollToRow != nextState.scrollToRow){
        this.props.onScroll({rowIndex: nextState.scrollToRow});
      }
    }
  }
}

const HookedArrowKeyStepper = hookArrowKeyStepper(ArrowKeyStepper);

class HistoryGrid extends React.Component {

  constructor (props) {
    super(props);
    this._rowClassName = this._rowClassName.bind(this);    
    this.rowGetter = this.rowGetter.bind(this);
    this.setSelectedRowIndex = this.setSelectedRowIndex.bind(this);
    this.selectRow = this.selectRow.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleArrowScroll = this.handleArrowScroll.bind(this);
    this.state = {};
  }

  rowGetter (index) {
    return this.props.data.rows[index];
  }


  setSelectedRowIndex (index) {
    this.setState({
      selectedRowIndex: index
    })
  }

  selectRow (index) {
    const rowData = this.rowGetter(index);
    if (this.stepper){
      this.stepper.setScrollIndexes({scrollToColumn:0, scrollToRow:index});
    }
    this.setSelectedRowIndex(index);
    this.props.itemSelectedHandler({index, rowData})
  }

  handleClick ({index}) {
    this.selectRow(index);
  }

  handleArrowScroll({rowIndex}) {
    this.selectRow(rowIndex);
  }

  render () {
    const {
      data,
      ...other
    } = this.props;

    const columns = data.headers.map((header, index) => {
      let cellRenderer = defaultCellRenderer;
      if (index === 0) {
        cellRenderer = timestampCellRenderer;
      } 
      return (
        <Column
          className="grid-column grid-cell"
          dataKey={header.key}
          flexGrow={1}
          flexShrink={0} 
          headerClassName="grid-header"
          key={header.key}
          label={header.title}
          cellRenderer={cellRenderer}
          width={100}
        />
      );
    });

    return (
      <HookedArrowKeyStepper
        className="grid-arrow-key-stepper"
        columnCount={data.headers.length}
        onScroll={this.handleArrowScroll}
        mode="cells"
        ref={(c) => this.stepper = c}
        rowCount={data.rows.length}
      >
        {({ onSectionRendered, scrollToColumn, scrollToRow }) => (
          <AutoSizer disableHeight>
          {({ height, width }) => (
            <Table
              className="grid"
              gridClassName="grid-body"
              headerClassName="grid-column grid-cell"
              headerHeight={27} 
              height={height}
              onRowClick={({...params}) => this.handleClick({...params})}
              onRowsRendered={({...params}) => onSectionRendered({...params})}
              ref={(c) => this.table = c}
              rowClassName={({index}) => this._rowClassName({index, selectedRowIndex:this.state.selectedRowIndex})} 
              rowCount={data.rows.length} 
              rowGetter={({ index }) => data.rows[index]}
              rowHeight={30} 
              rowRenderer={defaultRowRenderer}
              scrollToIndex={scrollToRow}
              width={width}
            >
              {columns}
            </Table>)}
          </AutoSizer>
        )}
      </HookedArrowKeyStepper>
    )
  }

  _rowClassName({index, selectedRowIndex}){
    if (index === -1 ){
      return 'grid-row grid-header';
    } else if (index === selectedRowIndex){
      return 'grid-row selected'
    }
    return 'grid-row';
  }
}

export default HistoryGrid;
