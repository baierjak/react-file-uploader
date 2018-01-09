/* eslint-disable no-undef, max-len */
jest.dontMock('../Receiver');
jest.dontMock('../index');
jest.dontMock('classnames');

import React from 'react';
import ReactDOM from 'react-dom';
import { jsdom } from 'jsdom';

const FileUploader = require('../index');
const { PENDING } = FileUploader.status;
const Receiver = FileUploader.Receiver;

const createComponent = (onDragEnter, onDragOver, onDragLeave, onFileDrop) => (
  <Receiver
    onDragEnter={onDragEnter}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onFileDrop={onFileDrop}
  />
);

// eslint-disable-next-line react/prefer-es6-class
const createTemplate = (initialState, props, Component) => React.createClass({
  getInitialState() { return initialState; },
  render() {
    return (
      <Component.type
        ref="receiver"
        isOpen={this.state.isOpen}
        files={this.state.files}
        {...props}
        {...Component.props}
      >
        <h1>Test</h1>
      </Component.type>
    );
  },
});

describe('Receiver', () => {
  const stringClass = 'receiver';
  const arrayClass = ['react', 'receiver'];

  const dragEnterEvent = document.createEvent('HTMLEvents');
  const dragOverEvent = document.createEvent('HTMLEvents');
  const dragLeaveEvent = document.createEvent('HTMLEvents');
  const dropEvent = document.createEvent('HTMLEvents');

  const testFile = {
    lastModified: 1465229147840,
    lastModifiedDate: 'Tue Jun 07 2016 00:05:47 GMT+0800 (HKT)',
    name: 'test.jpg',
    size: 1024,
    type: 'image/jpg',
    webkitRelativePath: '',
  };

  let container;
  let instance;
  let receiver;
  let ParentComponent;
  let createTestParent;

  let onDragEnter;
  let onDragOver;
  let onDragLeave;
  let onFileDrop;

  beforeEach(() => {
    global.document = jsdom();
    global.window = document.parentWindow;

    // mockup environment
    window.DragEvent = jest.fn();
    window.DataTransfer = jest.fn();

    const files = [testFile];

    const mockDT = {
      files,
      setData: jest.genMockFunction(),
    };

    dragEnterEvent.initEvent('dragenter', false, true);

    dragOverEvent.initEvent('dragover', false, true);
    dragOverEvent.preventDefault = jest.genMockFn();

    dragLeaveEvent.initEvent('dragleave', false, true);

    dropEvent.initEvent('drop', false, true);
    dropEvent.preventDefault = jest.genMockFn();
    dropEvent.dataTransfer = mockDT;
  });

  describe('state of dragLevel', () => {
    beforeEach(() => {
      const onDragEnterFn = jest.genMockFn();
      const onDragOverFn = jest.genMockFn();
      const onDragLeaveFn = jest.genMockFn();
      const onFileDropFn = jest.genMockFn();

      onDragEnter = onDragEnterFn;
      onDragOver = onDragOverFn;
      onDragLeave = onDragLeaveFn;
      onFileDrop = onFileDropFn;

      const Component = createComponent(onDragEnterFn, onDragOverFn, onDragLeaveFn, onFileDropFn);
      const template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      createTestParent = React.createFactory(template);
      ParentComponent = createTestParent();
      container = document.createElement('div');
      instance = ReactDOM.render(ParentComponent, container);
      receiver = instance.refs.receiver;
    });

    it('should increase state of dragLevel by 1 with dragEnter event', () => {
      const oldDragLevel = receiver.state.dragLevel;
      window.dispatchEvent(dragEnterEvent);
      const newDragLevel = receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);
    });

    it('should call onDragEnter with dragEnter event if isOpen is false', () => {
      window.dispatchEvent(dragEnterEvent);
      expect(onDragEnter).toBeCalled();
    });

    it('should not call onDragEnter with dragEnter event if isOpen is true', () => {
      instance.setState({ isOpen: true });
      window.dispatchEvent(dragEnterEvent);
      expect(onDragEnter).not.toBeCalled();
    });

    it('should call event.preventDefault with dragOver event', () => {
      window.dispatchEvent(dragOverEvent);
      expect(dragOverEvent.preventDefault).toBeCalled();
    });

    it('should call onDragOver with dragOver event', () => {
      window.dispatchEvent(dragOverEvent);
      expect(onDragOver).toBeCalled();
    });

    it('should decrease state of dragLevel by 1 with dragLeave event', () => {
      const oldDragLevel = receiver.state.dragLevel;
      window.dispatchEvent(dragEnterEvent);
      const newDragLevel = receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(dragLeaveEvent);
      const finalDragLevel = receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(newDragLevel - 1);
      expect(onDragLeave).toBeCalled();
    });

    it('should call onDragLeave if state of dragLevel is not 0', () => {
      const oldDragLevel = receiver.state.dragLevel;
      window.dispatchEvent(dragEnterEvent);
      const newDragLevel = receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(dragEnterEvent);
      const newerDragLevel = receiver.state.dragLevel;
      expect(newerDragLevel).toEqual(newDragLevel + 1);

      window.dispatchEvent(dragLeaveEvent);
      const finalDragLevel = receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(newerDragLevel - 1);
      expect(onDragLeave).not.toBeCalled();

      window.dispatchEvent(dragLeaveEvent);
      const endDragLevel = receiver.state.dragLevel;
      expect(endDragLevel).toEqual(finalDragLevel - 1);
      expect(onDragLeave).toBeCalled();
    });

    it('should call event.preventDefault with drop event', () => {
      window.dispatchEvent(dropEvent);
      // eslint-disable-next-line no-undef
      expect(dropEvent.preventDefault).toBeCalled();
    });

    it('should call onFileDrop with drop event', () => {
      window.dispatchEvent(dropEvent);
      expect(onFileDrop).toBeCalled();
    });

    it('should set state of dragLevel to 0 with dragEnter event', () => {
      const oldDragLevel = receiver.state.dragLevel;
      window.dispatchEvent(dragEnterEvent);
      const newDragLevel = receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(dropEvent);
      const finalDragLevel = receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(0);
    });

    it('should not call any callback after Receiver did unmount', () => {
      ReactDOM.unmountComponentAtNode(container);
      window.dispatchEvent(dragEnterEvent);
      expect(onDragEnter).not.toBeCalled();

      window.dispatchEvent(dragOverEvent);
      expect(onDragOver).not.toBeCalled();

      window.dispatchEvent(dragLeaveEvent);
      expect(onDragLeave).not.toBeCalled();

      window.dispatchEvent(dropEvent);
      expect(onFileDrop).not.toBeCalled();
    });
  });

  describe('callbacks and callback arguments', () => {
    beforeEach(() => {
      const onDragEnterFn = (e) => {
        expect(e.type).toBe('dragenter');
      };
      const onDragOverFn = (e) => {
        expect(e.type).toBe('dragover');
      };
      const onDragLeaveFn = (e) => {
        expect(e.type).toBe('dragleave');
      };
      const onFileDropFn = (e, _files) => {
        expect(e.type).toBe('drop');
        const file = _files[0];
        expect(file.lastModified).toBe(testFile.lastModified);
        expect(file.lastModifiedDate).toBe(testFile.lastModifiedDate);
        expect(file.name).toBe(testFile.name);
        expect(file.size).toBe(testFile.size);
        expect(file.type).toBe(testFile.type);
        expect(file.webkitRelativePath).toBe(testFile.webkitRelativePath);
        expect(file.status).toBe(PENDING);
        expect(file.progress).toBe(0);
        expect(file.src).toBe(null);
      };

      onDragEnter = onDragEnterFn;
      onDragOver = onDragOverFn;
      onDragLeave = onDragLeaveFn;
      onFileDrop = onFileDropFn;

      const Component = createComponent(onDragEnterFn, onDragOverFn, onDragLeaveFn, onFileDropFn);
      const template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      createTestParent = React.createFactory(template);
      ParentComponent = createTestParent();
      container = document.createElement('div');
      instance = ReactDOM.render(ParentComponent, container);
      receiver = instance.refs.receiver;
    });

    it('should execute the onDragEnter callback with a DragEvent with type `dragenter` as argument', () => {
      window.dispatchEvent(dragEnterEvent);
    });

    it('should execute the onDragOver callback with a DragEvent with type `dragover` as argument', () => {
      window.dispatchEvent(dragOverEvent);
    });

    it('should execute the onDragLeave callback with a DragEvent with type `dragleave` as argument', () => {
      window.dispatchEvent(dragLeaveEvent);
    });

    it('should execute the onFileDrop callback with a DragEvent with type `drop` as argument', () => {
      window.dispatchEvent(dropEvent);
    });
  });

  describe('#render', () => {
    beforeEach(() => {
      const Component = createComponent();
      const template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      createTestParent = React.createFactory(template);
      ParentComponent = createTestParent();
      container = document.createElement('div');

      instance = ReactDOM.render(ParentComponent, container);
      receiver = instance.refs.receiver;
    });

    it('should render nothing if isOpen is false', () => {
      const receiverNode = ReactDOM.findDOMNode(receiver);
      expect(receiverNode).toBeNull();
      instance.setState({ isOpen: true });
    });

    it('should render a div wrapper with children if isOpen is true', () => {
      instance.setState({ isOpen: true });
      const receiverNode = ReactDOM.findDOMNode(receiver);
      expect(receiverNode).toEqual(jasmine.any(HTMLDivElement));
      expect(receiverNode.firstElementChild).toEqual(jasmine.any(HTMLHeadingElement));
    });

    it('should render a div wrapper with customClass in string', () => {
      const Component = createComponent();
      const template = createTemplate({ isOpen: true, files: [] }, { customClass: stringClass }, Component);

      createTestParent = React.createFactory(template);
      ParentComponent = createTestParent();
      container = document.createElement('div');
      instance = ReactDOM.render(ParentComponent, container);
      receiver = instance.refs.receiver;

      const receiverNode = ReactDOM.findDOMNode(receiver);
      expect(receiverNode.className).toEqual(stringClass);
    });

    it('should render a div wrapper with customClass in array', () => {
      const Component = createComponent();
      const template = createTemplate({ isOpen: true, files: [] }, { customClass: arrayClass }, Component);

      createTestParent = React.createFactory(template);
      ParentComponent = createTestParent();
      container = document.createElement('div');
      instance = ReactDOM.render(ParentComponent, container);
      receiver = instance.refs.receiver;

      const receiverNode = ReactDOM.findDOMNode(receiver);
      expect(receiverNode.className).toEqual(arrayClass.join(' '));
    });
  });
});
/* eslint-enable no-undef */
