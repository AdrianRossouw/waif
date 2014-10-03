var express = require('express');

module.exports = function(config) {
  var waif = this.waif;

  var users = waif('github/users');
  var repo = waif('github/repo');

  var app = express();

  app.get('/', function(req, res) {
    res.redirect('/'+config.owner);
  });

  app.route('/:owner')
    .get(loadOwner)
    .get(render);

  app.route('/:owner/:repo')
    .get(loadOwner)
    .get(loadRepo)
    .get(render);

  return app;

  function render(req, res, next) {
    res.send(req.data);
  }

  function loadOwner(req, res, next) {
    req.data = req.data || {};

    var owner = req.params.owner || config.owner;
    users(owner+'/repos', function(err, resp, body) {
      console.log(body);
      if (err || resp.statusCode !== 200) { return next(err); }
      req.data.owner = body;
      next();
    });
  }

  function loadRepo(req, res, next) {
    req.data = req.data || {};

    repo(req.data.owner + '/' + req.params.repo, function(err, resp, body) {
      if (err || resp.statusCode !== 200) { return next(err); }
      req.data.repo = body;
      next();
    });
  }
};
