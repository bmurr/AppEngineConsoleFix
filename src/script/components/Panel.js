import React from 'react';

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

export default Panel;
