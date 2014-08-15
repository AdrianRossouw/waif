/* global describe, it, before, beforeEach, after, afterEach */
var Waif    = require('../');
var pipe    = require('../pipe');
var send    = require('../send');
var should  = require('should');
var through = require('through');


describe('request local service', function() {
  var waif = null;

  before(function() {
    waif = Waif.createInstance();

    this.service = waif('local')
      .use(send({msg: 'ok'}))
      .listen();

    this.proxy = waif('proxy')
      .use(pipe(this.service.requestUrl()));

    waif.start();
  });

  after(function() { waif.stop(); });


  it('piping a request works', function(doneFn) {
    this.proxy('/filename.jpg')
      .pipe(through(pipeFn))
      .on('error', doneFn)
      .on('close', doneFn);

    function pipeFn(data) {
      this.queue(data);
    }
  });
});
