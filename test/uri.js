/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');

var state = require('state');

// Load the state machine definition
var Uri = require('../state/uri');

describe('URI state machine', function() {
  // plain javascript object
  var uri = {};

  before(function() {
    uri = new Uri();
  });

  it('makes objects stateful', function() {
    should.exist(uri.state);
    uri.state.should.be.Function;
  });

  it('should have Initial state', function() {
    uri.state().name.should.equal('Initial');
  });

  it('should not be able to go Url', function() {
    // officially sanction method
    uri.state().change('Url');
    uri.state().name.should.equal('Initial');

  });
  it('should not be able to go Port', function() {
    // more convenient alias
    uri.state().go('Port');
    uri.state().name.should.equal('Initial');

  });
  it('should be able to go File', function() {
    // magic shorthand. not recommended
    uri.state('-> File');
    uri.state().name.should.equal('File');
  });
});

describe('change states with input', function() {
  var uri = null;

  // wrap the object with a state machine
  beforeEach(function() {
    uri = new Uri();
  });

  it('should consider no input a filename', function() {
    uri.set();
    uri.state().name.should.equal('File');
  });

  it('should handle ports', function() {
    uri.set(3000);
    uri.state().name.should.equal('Port');
  });


  it('should handle urls', function() {
    uri.set('http://api.example.com/v2');
    uri.state().name.should.equal('Url');
  });


  it('should handle filenames', function() {
    uri.set('/tmp/example.sock');
    uri.state().name.should.equal('File');
  });

});

describe('request urls', function() {
  var uri = null;

  // wrap the object with a state machine
  beforeEach(function() {
    uri = new Uri();
  });

  it('sockets should give valid urls', function() {
    uri.set();
    var filename = uri.getFilename();
    var socket = 'unix:/' + filename;
    var url = require('url');
    var _url =  url.parse(socket);
    uri.requestUrl().should.equal(socket);
    uri.requestUrl('path').should.equal(socket + '/path');
    uri.requestUrl('/path').should.equal(socket + '/path');
  });

  it('ports should give valid urls', function() {
    uri.set(3000);
    var portUrl = 'http://0.0.0.0:3000';

    uri.requestUrl().should.equal(portUrl + '/');
    uri.requestUrl('path').should.equal(portUrl + '/path');
    uri.requestUrl('/path').should.equal(portUrl + '/path');
  });


  it('urls should give valid urls', function() {
    var urlUrl = 'http://test.example.com:3200/api/test';
    uri.set(urlUrl);

    uri.requestUrl().should.equal(urlUrl + '/');
    uri.requestUrl('path').should.equal(urlUrl + '/path');
    uri.requestUrl('/path').should.equal(urlUrl + '/path');
  });

});

describe('listen urls', function() {
  var uri = null;

  // wrap the object with a state machine
  beforeEach(function() {
    uri = new Uri();
  });

  it('sockets should give valid urls', function() {
    uri.set();
    var filename = uri.getFilename();
    uri.listenUrl()[0].should.equal(filename);
  });

  it('ports should give valid urls', function() {
    uri.set(3000);
    uri.listenUrl()[0].should.equal(3000);
  });


  it('urls should give valid urls', function() {
    var urlUrl = 'http://test.example.com:3200/api/test';
    uri.set(urlUrl);
    uri.listenUrl()[0].should.equal(3200);
    uri.listenUrl()[1].should.equal('test.example.com');
  });


});
