/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');
var Waif = require('../');
var Service = require('../service');

var waif = Waif();

describe('Waif module', function() {
  it('has createInstance method', function() {
    should.exist(Waif.createInstance);
    Waif.createInstance.should.be.Function;
  });
  it('call should give instance', function() {
    should.exist(waif);
    waif.should.be.Function;
  });
});
describe('Waif instances', function() {
  before(function() {
    this.instance = Waif.createInstance();
  });
  it('should create a unique instance', function() {
    waif.should.not.equal(this.instance);
  });
});

describe('Service module', function() {
  it('has createInstance method', function() {
    should.exist(Service.createInstance);
    Service.createInstance.should.be.Function;
  });
});

describe('Service instances', function() {
  before(function() {
    this.instance = Service.createInstance('test-service');
  });
  it('should create an instance', function() {
    should.exist(this.instance);
    Service.should.be.Function;
  });
  it('should have public api functions', function() {
    should.exist(this.instance.request);
    should.exist(this.instance.start);
    should.exist(this.instance.stop);
    should.exist(this.instance.use);
    should.exist(this.instance.listen);
  });
});
