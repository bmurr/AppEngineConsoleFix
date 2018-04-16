import React from 'react';

class ContainerFooter extends React.Component {
  render() {
    if (!this.props.dataTable) {
      return null;
    }

    return (<div className="footer">
      <div className="footer-content">
        <div className="footer-component">{this.props.dataTable.summary.logCount} records found | {this.props.dataTable.summary.usage} total</div>
        <div className="footer-component">
          <button onClick={this.props.toggleImportExportPanel}>Import/Export</button>
          <b>{this.props.namespace}</b>
        </div>
      </div>
    </div>)
  }
}

export default ContainerFooter;
