import React from 'react';

import CodeArea from './CodeArea';
import Panel from './Panel';

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

export default ImportExportPanel;
