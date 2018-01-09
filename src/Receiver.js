import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import classNames from 'classnames';
import shortid from 'shortid';
import status from './constants/status';

class Receiver extends Component {
  constructor(props) {
    super(props);

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onFileDrop = this.onFileDrop.bind(this);

    // this is to monitor the hierarchy
    // for window onDragEnter event
    this.state = {
      dragLevel: 0,
    };
  }

  componentDidMount() {
    invariant(
      !!window.DragEvent && !!window.DataTransfer,
      'Upload end point must be provided to upload files'
    );

    const eventTarget = document.getElementById(this.props.wrapperId) || window;

    eventTarget.addEventListener('dragenter', this.onDragEnter);
    eventTarget.addEventListener('dragleave', this.onDragLeave);
    eventTarget.addEventListener('dragover', this.onDragOver);
    eventTarget.addEventListener('drop', this.onFileDrop);
  }

  componentWillUnmount() {
    const eventTarget = document.getElementById(this.props.wrapperId) || window;

    eventTarget.removeEventListener('dragenter', this.onDragEnter);
    eventTarget.removeEventListener('dragleave', this.onDragLeave);
    eventTarget.removeEventListener('dragover', this.onDragOver);
    eventTarget.removeEventListener('drop', this.onFileDrop);
  }

  onDragEnter(e) {
    const dragLevel = this.state.dragLevel + 1;

    this.setState({ dragLevel });

    if (!this.props.isOpen) {
      this.props.onDragEnter(e);
    }
  }

  onDragLeave(e) {
    const dragLevel = this.state.dragLevel - 1;

    this.setState({ dragLevel });

    if (dragLevel === 0) {
      this.props.onDragLeave(e);
    }
  }

  onDragOver(e) {
    e.preventDefault();
    this.props.onDragOver(e);
  }

  onFileDrop(e) {
    // eslint-disable-next-line no-param-reassign
    e = e || window.event;
    e.preventDefault();

    const files = [];

    if (!!e.dataTransfer) {
      const fileList = e.dataTransfer.files || [];

      for (let i = 0; i < fileList.length; i ++) {
        fileList[i].id = shortid.generate();
        fileList[i].status = status.PENDING;
        fileList[i].progress = 0;
        fileList[i].src = null;
        files.push(fileList[i]);
      }
    }

    // reset drag level once dropped
    this.setState({ dragLevel: 0 });

    this.props.onFileDrop(e, files);
  }

  render() {
    const { isOpen, customClass, style, children } = this.props;

    return (
      isOpen ? (
        <div className={classNames(customClass)} style={style}>
          {children}
        </div>
      ) : null
    );
  }
}

Receiver.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  isOpen: PropTypes.bool.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func.isRequired,
  onFileDrop: PropTypes.func.isRequired,
  wrapperId: PropTypes.string,
  style: PropTypes.object,
};

export default Receiver;
