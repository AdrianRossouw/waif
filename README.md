__THIS LIBRARY IS IN THE FIRST STAGES OF DEVELOPMENT.  
DO NOT EXPECT IT TO WORK AT ALL YET.__

## Waif

Waif provides the smallest possible abstraction that would allow you to  
to write an express-based microservice that can be used as a local library  
or a remote instance.  

__Waif is developed by [Wayfinder](http://wayfinder.co) and is (almost) being  
used in production where we deploy our services using [Longshoreman](http://longshoreman.io).__

### How it works

Waif is a thin wrapper around express.js when we declare our  
services, and a thin wrapper around request when we call them.

It splits the declaration and implementation of the services into separate files.

Doing this allows you the greatest amount of flexibility and scaleability,  
since you can run the service in many environments.

### Service Entry Point Example

Each microservice can be used and re-used in many different contexts,
therefor there is a separate step where you configure all the services
you will use, and where they will be accessed.


```javascript
// file: production.js

// get an instance of waif
var waif = require('waif')();

// used to proxy to other addresses
var pipe = require('waif/pipe');

// used to return content verbatim
var send = require('waif/send');

waif('user')
  .use(pipe, 'http://user.example.com/v3');
  .listen();

wait('my-service')
  .use('/ping', send, 'pong')
  .use(require('./src/my-service'))
  .listen(3000);
```

### Service Example

```javascript
// file: src/my-service.js

// always return a function
module.exports = function(config) {
  // you can use anything that is connect-like.
  var app = require('express')();

  // services are passed these as context 
  var waif = this.waif;
  var service = this.service;

  // map the defined user service
  var user = waif('user');

  // set up any routes you want to use
  app.get('/profile/:userId', function(req, res, next) {

    // the services registered are used just like request.
    user(req.param.userId, function(err, resp, body) {
      if (err || resp.statusCode !== 200) { return next(resp.statusCode); }

      res.render('profile', body);
    });
  });

  // return your middleware instead of listening.
  return app;
};
```

### About Service Configuration

Each repository may contain zero or more of
these entry points, which may represent one
or more environments.

These may map services differently depending
on how you need to access them.

How the configuration gets into Waif is entirely
up to the developer. It just provides the
API to declare them, in a way that the services
don't need to care about it.
