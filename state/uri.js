// State machine representing URI's
//
// Cleans up the logic of connecting via ports,
// urls or file sockets.

var state = require('state');
var isUrl = require('is-url');
var _ = require('lodash');
var norma = require('norma');
var url = require('url');
var path = require('path');
var temp         = require('temp').track();

var Uri = function(options) {
  this.initialize();
  return this;
};

Uri.prototype.initialize = function() {
  state(this, {
    // Possible states for the URI
    Initial: state('initial', {

      // Change state based on input.
      set: function(input) {
        this.input = input;

        // attempt each state in order.
        // guards will stop them.
        this.state().go('Port');
        this.state().go('Url');
        this.state().go('File');
      }
    }),

    Port: state({
      admit: { // format: 3000
        Initial: function() { return _.isNumber(this.owner.input); }
      },
      arrive: function() {
        this.setPort(this.input);
      },
      setPort: function(port) {
        this.url = url.parse('http://0.0.0.0:'+port);
      },
      listenUrl: function() {
        return [this.input];
      }
    }),

    Url: state({
      admit: { // format: 'http://api.example.com'
        Initial: function() { return isUrl(this.owner.input); }
      },
      arrive: function() {
        this.url = url.parse(this.input + '/');
      }
    }),

    File: state({
      admit: { // format: '/filename.sock' or undefined
        Initial: function() { return true; }
      },
      arrive: function() {
        this.filename = this.input || temp.path();
        this.url = 'http://unix:' + this.filename+':/';
      },
      getFilename: function() {
        return this.filename;
      },
      requestUrl: function(_path) {
        var noslash = (_path||'').replace(/^\//, '');
        return 'http://unix:' + this.filename + ":/" + noslash;
      },
      listenUrl: function() {
        return [this.filename];
      }
    }),

    // default for all
    get: function() {
      return this.url;
    },

    // append the request path.
    requestUrl: function() {
      var args = norma('path:s?', arguments);
      var _url = url.format(_.clone(this.url));
      var _path = (args.path || '').replace(/^\//, '');
      return url.resolve(_url, _path);
    },
    // always returns an array
    // due to http.listen(3000, '10.0.0.1');
    listenUrl: function() {
      var results = [parseInt(this.url.port, 10)];
      this.url.hostname && results.push(this.url.hostname);
      return results;
    },

    setPort: function() {}
  });
};


module.exports = Uri;
