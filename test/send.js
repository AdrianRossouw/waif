/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');
var Waif = require('../');
var send = require('../send');

describe('send a response', function() {
  var waif = null;

  before(function() {
    waif = Waif.createInstance();
    waif('ping')
      .use(send, 'pong')
      .listen();

    waif('json')
      .use(send, {msg: 'ok'})
      .listen();

    waif.start();
  });

  after(function() { waif.stop(); });


  it('can send pong', function(doneFn) {
    var ping = waif('ping');

    ping(test);

    function test(err, resp, body) {
      should.not.exist(err);
      body.should.equal('pong');
      doneFn();
    }
  });

  
  it('can send json', function(doneFn) {
    var ping = waif('json');

    ping(test);

    function test(err, resp, body) {
      body.should.have.property('msg', 'ok');
      doneFn();
    }
  });

});

