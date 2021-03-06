/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');
var Status = require('../state/status');

describe('Connection status state machine', function() {
  var status = null;

  before(function() {
    status = new Status();
  });

  it('is a state machine',  function() {
    should.exist(status.state);
    status.state.should.be.Function;
  });

  it('is in the root state', function() {
    status.state().name.should.equal('Stopped');
  });
});

