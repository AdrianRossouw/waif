/* global describe, it, before, beforeEach, after, afterEach */
var Waif    = require('../');
var pipe    = require('../pipe');
var send    = require('../send');
var http    = require('http');
var should  = require('should');
var through = require('through2');


describe('pipe service', function() {
  var waif = null;

  before(function() {
    waif = Waif.createInstance();

    this.service = waif('local')
      .use(send, {msg: 'ok'})
      .listen(3005);

    this.proxy = waif('proxy')
      .pipe(this.service.requestUrl())
      .listen();

    this.proxyParams = waif('proxyParams')
      .pipe('/:foo/:bar', this.service.requestUrl() + ':bar/:foo')
      .listen();

    waif.start();
  });

  after(function() { waif.stop(); });


  it('request works', function(doneFn) {
    this.proxy('filename.jpg', function(err, resp, body) {
      if (err || resp.statusCode !== 200) { return doneFn(resp.statusCode); }
      should.exist(body);
      body.should.have.property('msg', 'ok');
      doneFn();
    });
  });

  it('allows parameter restructuring', function(doneFn) {
    this.proxyParams('mike/bike', function(err, resp, body) {
      if (err || resp.statusCode !== 200) { return doneFn(resp.statusCode); }
      should.exist(body);
      body.should.have.property('msg', 'ok');
      doneFn();
    });
  });
});


describe('killing streams mid-way', function() {
  var waif = null;

  var server = http.createServer();
  var instance;

  // we just close the request after answering it.
  server.on('request', function(req, res, next) {
    if (req.url === '/response') {
      return res.socket.end();
    }
    if (req.url === '/server') {
      server.close();
    }
    if (req.url === '/request') {
      return req.socket.end();
    }
  });

  before(function(done) {
    waif = Waif.createInstance();

    instance = server.listen(0, '0.0.0.0', function(err) {
      waif('fails')
        .pipe('http://localhost:'+instance.address().port)
        .listen(0);

      waif.start();

      done();
    });
  });

  after(function() {
    waif.stop();
  });

  it('killing a response', function(done) {
    waif('fails')('response', function(err, resp, body) {
      should.not.exist(err);
      resp.statusCode.should.not.eql(200);
      body.should.have.property('code', 'ECONNRESET');
      done();
    });
  });

  it('killing a request', function(done) {
    waif('fails')('response', function(err, resp, body) {
      should.not.exist(err);
      resp.statusCode.should.not.eql(200);
      body.should.have.property('code', 'ECONNRESET');
      done();
    });
  });


  it.skip('killing the server', function(done) {
    waif('fails')('server', function(err, resp, body) {
      should.not.exist(err);
      resp.statusCode.should.not.eql(200);
      body.should.have.property('code', 'ECONNRESET');
      done();
    });
  });
});
