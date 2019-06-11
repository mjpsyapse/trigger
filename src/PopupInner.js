import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LazyRenderBox from './LazyRenderBox';

class PopupInner extends Component {
  static propTypes = {
    hiddenClassName: PropTypes.string,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseDown: PropTypes.func,
    onTouchStart: PropTypes.func,
    children: PropTypes.any,
    forwardedRef: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.ref = props.forwardedRef || React.createRef();
  }
  render() {
    const props = this.props;
    let className = props.className;
    if (!props.visible) {
      className += ` ${props.hiddenClassName}`;
    }

    return (
      <div
        className={className}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        onMouseDown={props.onMouseDown}
        onTouchStart={props.onTouchStart}
        style={props.style}
        ref={this.ref}
      >
        <LazyRenderBox className={`${props.prefixCls}-content`} visible={props.visible}>
          {props.children}
        </LazyRenderBox>
      </div>
    );
  }
}

export default PopupInner;
