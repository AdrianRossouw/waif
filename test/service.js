/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');
var _ =  require('lodash');

var Waif = require('../');

describe('request local service', function() {
  var waif = null;

  beforeEach(function() {
    waif = Waif.createInstance();
  });

  it ('should call the service function', function(doneFn) {
    waif('service')
      .use(_service, 'valid config')
      .listen();

    waif.start();

    function _service(config) {
      config.should.eql('valid config');

      should.exist(this.waif);
      this.waif.should.be.Function;

      should.exist(this.service);
      this.service.should.have.property('name', 'service');

      this.waif('service').should.be.Function;

      _.defer(doneFn);
      return function() {};
    }
  });

  afterEach(function() { waif.stop(); });
});
