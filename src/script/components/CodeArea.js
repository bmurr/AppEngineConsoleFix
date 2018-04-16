import React from 'react';

import AceEditor from 'react-ace';
import 'brace/mode/python';
import 'brace/mode/json';
import 'brace/theme/tomorrow';

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

export default CodeArea;
