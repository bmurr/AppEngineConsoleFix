import React from 'react';

class SearchBar extends React.Component {

  constructor(props) {
    super(props);    
    this.getInitialState = this.getInitialState.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.updateInputValue = this.updateInputValue.bind(this);
    
    this.search = this.search.bind(this);

    this.state = this.getInitialState();
  }

  getInitialState(){
    return {
      inputValue: ''
    }
  }

  componentDidMount() {
    this.textInput.focus();
  }

  search(text){
    this.props.searchHandler(text);
  }

  handleKeyPress(event){
    if (event.key === 'Enter') {
      this.search(this.state.inputValue)
    }
  }

  updateInputValue(event){
    this.setState({
      inputValue: event.target.value
    });
  }

  render() {
    return (
      <div className="search-bar">
        <input
          type="text"
          value={this.state.inputValue} 
          onChange={this.updateInputValue}
          onKeyPress={this.handleKeyPress}
          ref={(input) => { this.textInput = input; }} />
      </div>)
  }
}

export default SearchBar;
