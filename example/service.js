/**
* Example service entry point.
*
* The purpose of these entry points is to map
* and configure all the services that the service
* will need to connect to.
*
* You give the services names, and waif keeps track
* of what the connection details you give it.
*
* Each service may have zero or more of these
* configuration files, and may point to remote
* services or load up it's own copies.
*
* This service declares :
*
*   * Example service itself, listening on port 3000
*   * Gallery service, mounted at /gallery on the example service.
*   * Event service, hosted on a remote HTTP server.
*   * MongoDB store service, hosted on a local socket.
*
* For configuration :
*
* It uses variables that are populated by env vars that
* default to hardcoded strings.
*/

// Return a new instance of Waif.
var waif = require('waif')();
var redirect = require('waif/redirect');

// Configuration.
var PORT = process.env.PORT || 3000;
var SOCKET = process.env.SOCKET || '/tmp/sockets/test-data.sock';
var MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/test";
var EVENT_URL = process.env.EVENT_URL || 'http://event.example.com';

var mongoStore = require('waif-mongo-store');
var mongoConfig = { url: MONGO_URL };

// Declaring internally used service.
waif('store')                               // data access service.
  .use(mongoStore(mongoConfig))             // uses mongo as a data store.
  .listen();                                // random socket file.

// Declaring an external REST api.
waif('event')                               // event logging service.
  .use(redirect(EVENT_URL));                // all requests directed here.

// Declaring a service to be mounted on another one.
// From a relative submodule, with it's own views.
// Note: the absence of forward() or listen()
waif('gallery')                             // photo gallery service.
  .use(require('./gallery'));               // relative submodule.


// Example application service
// Note how we .use() the waif('sandbox') service.
waif('example')                             // the example service itself.
  .use('/gallery', waif('sandbox'))         // mount the sandbox service.
  .use(require('./src/example'))            // mount the service' own app.
  .listen(PORT);                            // listen on a specific port.

// Start up the servers.
// Has a companion stop method which closes them all.
waif.start();

