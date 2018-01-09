/* eslint-disable no-undef, max-len */
jest.dontMock('../UploadManager');
jest.dontMock('../index');
jest.dontMock('classnames');
jest.dontMock('lodash');

import React from 'react';
import ReactDOM from 'react-dom';
import { jsdom } from 'jsdom';
import nock from 'nock';

const FileUploader = require('../index');
const UploadManager = FileUploader.UploadManager;
const uploadStatus = FileUploader.status;

describe('UploadManager', () => {
  const stringClass = 'receiver';
  const arrayClass = ['react', 'receiver'];
  const style = { display: 'block' };
  const uploadPath = 'http://localhost:3000/api/upload';

  const onUploadStart = jest.fn();
  const onUploadProgress = jest.fn();
  const onUploadEnd = jest.fn();

  let children;
  let instance;
  let container;

  beforeEach(() => {
    global.document = jsdom();
    global.window = document.parentWindow;

    children = <p>children</p>;
    container = document.createElement('div');
    document.body.appendChild(container);

    instance = ReactDOM.render(
      <UploadManager
        uploadUrl={uploadPath}
        onUploadEnd={onUploadEnd}
      >
        {children}
      </UploadManager>,
      container
    );
  });

  afterEach(() => {
    container = null;
    instance = null;
  });

  describe('#render()', () => {
    it('should render ul element by default', () => {
      const node = ReactDOM.findDOMNode(instance);
      expect(node).toEqual(jasmine.any(HTMLUListElement));
      expect(node.firstElementChild).toEqual(jasmine.any(HTMLParagraphElement));
    });

    it('should render wrapper element according to component props', () => {
      instance = ReactDOM.render(
        <UploadManager
          component="div"
          uploadUrl={uploadPath}
          onUploadEnd={onUploadEnd}
        >
          {children}
        </UploadManager>,
        container
      );
      const node = ReactDOM.findDOMNode(instance);
      expect(node).toEqual(jasmine.any(HTMLDivElement));
    });

    it('should render a wrapper with customClass in string', () => {
      instance = ReactDOM.render(
        <UploadManager
          component="div"
          customClass={stringClass}
          style={style}
          uploadUrl={uploadPath}
          onUploadEnd={onUploadEnd}
        >
          {children}
        </UploadManager>,
        container
      );
      const node = ReactDOM.findDOMNode(instance);
      expect(node.className).toEqual(stringClass);
    });

    it('should render a wrapper with customClass in array', () => {
      instance = ReactDOM.render(
        <UploadManager
          component="div"
          customClass={arrayClass}
          style={style}
          uploadUrl={uploadPath}
          onUploadEnd={onUploadEnd}
        >
          {children}
        </UploadManager>,
        container
      );
      const node = ReactDOM.findDOMNode(instance);
      expect(node.className).toEqual(arrayClass.join(' '));
    });
  });

  describe('#uploadErrorHandler()', () => {
    const err = new Error('not found');
    const errorResponse = { body: { success: false, errors: { message: 'not found' } } };
    const successResponse = { body: { success: true } };
    let errorHandler;

    beforeEach(() => {
      errorHandler = instance.props.uploadErrorHandler;
    });

    it('should return an object contains key of `error` and `result`', () => {
      const result = errorHandler(null, successResponse);
      expect(result.error).toBeNull();
      expect(result.result).toEqual(successResponse.body);
    });

    it('should return an object with key of `error` with value equals to the first argument if it is not empty', () => {
      const result = errorHandler(err, successResponse);
      expect(result.error).toEqual(err.message);
      expect(result.result).toEqual(successResponse.body);
    });

    it('should return an object with key of `error` with value equals to the value of `body.error` of the second argument if it is not empty', () => {
      const result = errorHandler(null, errorResponse);
      expect(result.error).toEqual(errorResponse.body.errors);
      delete errorResponse.body.errors;
      expect(result.result).toEqual(errorResponse.body);
    });
  });

  describe('#upload()', () => {
    let successResponse;

    beforeEach(() => {
      nock('http://localhost:3000')
        .filteringRequestBody(() => '*')
        .post('/api/upload', '*')
        .reply(200, successResponse);

      instance = ReactDOM.render(
        <UploadManager
          uploadUrl={uploadPath}
          onUploadStart={onUploadStart}
          onUploadProgress={onUploadProgress}
          onUploadEnd={onUploadEnd}
        >
          {children}
        </UploadManager>,
        container
      );
      successResponse = { success: true };
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should call onUploadStart prop functions if it is given', () => {
      instance.upload(instance.props.uploadUrl, {});
      expect(onUploadStart).toBeCalledWith({ status: uploadStatus.UPLOADING });
    });
  });
});
