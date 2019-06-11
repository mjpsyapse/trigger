import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Align from '@mjpsyapse/rc-align';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PopupInner from './PopupInner';
import LazyRenderBox from './LazyRenderBox';


class Popup extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    style: PropTypes.object,
    getClassNameFromAlign: PropTypes.func,
    onAlign: PropTypes.func,
    getRootDomNode: PropTypes.func,
    align: PropTypes.any,
    destroyPopupOnHide: PropTypes.bool,
    maskTransitionName: PropTypes.string,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseDown: PropTypes.func,
    onTouchStart: PropTypes.func,
    stretch: PropTypes.string,
    children: PropTypes.node,
    ref: PropTypes.any,
    point: PropTypes.shape({
      pageX: PropTypes.number,
      pageY: PropTypes.number,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      // Used for stretch
      stretchChecked: false,
      targetWidth: undefined,
      targetHeight: undefined,
    };

    this.popupRef = this.props.ref || React.createRef();
  }

  componentDidMount() {
    this.setStretchSize();
  }

  componentDidUpdate() {
    this.setStretchSize();
  }

  onAlign = (popupDomNode, align) => {
    const props = this.props;
    const currentAlignClassName = props.getClassNameFromAlign(align);
    // FIX: https://github.com/react-component/trigger/issues/56
    // FIX: https://github.com/react-component/tooltip/issues/79
    if (this.currentAlignClassName !== currentAlignClassName) {
      this.currentAlignClassName = currentAlignClassName;
      popupDomNode.className = this.getClassName(currentAlignClassName);
    }
    props.onAlign(popupDomNode, align);
  }

  // Record size if stretch needed
  setStretchSize = () => {
    const { stretch, getRootDomNode, visible } = this.props;
    const { stretchChecked, targetHeight, targetWidth } = this.state;

    if (!stretch || !visible) {
      if (stretchChecked) {
        this.setState({ stretchChecked: false });
      }
      return;
    }

    const $ele = getRootDomNode();
    if (!$ele) return;

    const height = $ele.offsetHeight;
    const width = $ele.offsetWidth;

    if (targetHeight !== height || targetWidth !== width || !stretchChecked) {
      this.setState({
        stretchChecked: true,
        targetHeight: height,
        targetWidth: width,
      });
    }
  };

  getPopupDomNode() {
    return this.popupRef.current && this.popupRef.current.ref.current;
  }

  getTargetElement = () => {
    return this.props.getRootDomNode();
  }

  // `target` on `rc-align` can accept as a function to get the bind element or a point.
  // ref: https://www.npmjs.com/package/rc-align
  getAlignTarget = () => {
    const { point } = this.props;
    if (point) {
      return point;
    }
    return this.getTargetElement;
  }

  getMaskTransitionName() {
    const props = this.props;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getTransitionName() {
    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName || 'enter';
  }

  getClassName(currentAlignClassName) {
    return `${this.props.prefixCls} ${this.props.className} ${currentAlignClassName}`;
  }

  getPopupElement() {
    const { stretchChecked, targetHeight, targetWidth } = this.state;
    const {
      align, visible,
      prefixCls, style, getClassNameFromAlign,
      destroyPopupOnHide, stretch, children,
      onMouseEnter, onMouseLeave, onMouseDown, onTouchStart,
    } = this.props;
    const className = this.getClassName(this.currentAlignClassName ||
      getClassNameFromAlign(align));
    const hiddenClassName = `${prefixCls}-hidden`;

    if (!visible) {
      this.currentAlignClassName = null;
    }

    const sizeStyle = {};
    if (stretch) {
      // Stretch with target
      if (stretch.indexOf('height') !== -1) {
        sizeStyle.height = targetHeight;
      } else if (stretch.indexOf('minHeight') !== -1) {
        sizeStyle.minHeight = targetHeight;
      }
      if (stretch.indexOf('width') !== -1) {
        sizeStyle.width = targetWidth;
      } else if (stretch.indexOf('minWidth') !== -1) {
        sizeStyle.minWidth = targetWidth;
      }

      // Delay force align to makes ui smooth
      if (!stretchChecked) {
        sizeStyle.visibility = 'hidden';
        setTimeout(() => {
          if (this.alignInstance) {
            this.alignInstance.forceAlign();
          }
        }, 0);
      }
    }

    const newStyle = {
      ...sizeStyle,
      ...style,
      ...this.getZIndexStyle(),
    };

    const popupInnerProps = {
      className,
      prefixCls,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onTouchStart,
      style: newStyle,
    };
    if (destroyPopupOnHide) {
      if (!visible) {
        this.popupRef.current = null;
      }
      return (
        <ReactCSSTransitionGroup
          transitionAppear
          transitionAppearTimeout={200}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
          transitionName={this.getTransitionName()}
        >
          {visible ? (
            <Align
              target={this.getAlignTarget()}
              key="popup"
              forwardedRef={this.popupRef} // align passes ref to child
              monitorWindowResize
              align={align}
              onAlign={this.onAlign}
            >
              <PopupInner
                visible
                {...popupInnerProps}
              >
                {children}
              </PopupInner>
            </Align>
          ) : null}
        </ReactCSSTransitionGroup>
      );
    }

    return (
      <ReactCSSTransitionGroup
        transitionAppear
        transitionAppearTimeout={200}
        transitionEnterTimeout={200}
        transitionLeaveTimeout={200}
        transitionName={this.getTransitionName()}
      >
        <Align
          target={this.getAlignTarget()}
          key="popup"
          forwardedRef={this.popupRef} // align passes ref to child
          monitorWindowResize
          xVisible={visible}
          childrenProps={{ visible: 'xVisible' }}
          disabled={!visible}
          align={align}
          onAlign={this.onAlign}
        >
          <PopupInner
            hiddenClassName={hiddenClassName}
            {...popupInnerProps}
          >
            {children}
          </PopupInner>
        </Align>
      </ReactCSSTransitionGroup>
    );
  }

  getZIndexStyle() {
    const style = {};
    const props = this.props;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  }

  getMaskElement() {
    const props = this.props;
    let maskElement;
    if (props.mask) {
      const maskTransition = this.getMaskTransitionName();
      maskElement = (
        <LazyRenderBox
          style={this.getZIndexStyle()}
          key="mask"
          className={`${props.prefixCls}-mask`}
          hiddenClassName={`${props.prefixCls}-mask-hidden`}
          visible={props.visible}
        />
      );
      if (maskTransition) {
        maskElement = (
          <ReactCSSTransitionGroup
            key="mask"
            transitionAppear
            transitionAppearTimeout={200}
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}
            transitionName={maskTransition}
          >
            {maskElement}
          </ReactCSSTransitionGroup>
        );
      }
    }
    return maskElement;
  }

  render() {
    return (
      <div>
        {this.getMaskElement()}
        {this.getPopupElement()}
      </div>
    );
  }
}

export default Popup;
