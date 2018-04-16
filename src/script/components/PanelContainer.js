import React from 'react';

class PanelContainer extends React.Component {
  render() {
    return (
      <div className="panel-container">
        {this.props.children}
      </div>)
  }
}

export default PanelContainer;
