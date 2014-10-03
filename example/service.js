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
*/

var waif = require('../waif')();
var service = require('./src/github');

var PORT = process.env.PORT || 3000;

var ghOpts = {
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Waif-Example-App'
  }
};

var ghDomain = 'https://api.github.com';

waif('github/repo')
  .pipe('/:owner/:repo', ghDomain+'/repos/:owner/:repo', ghOpts)
  .listen(0);

waif('github/users')
  .pipe('/:user', ghDomain+'/users/:user', ghOpts)
  .listen(0);

waif('app')
  .send('/favicon.ico', null)
  .pipe('/:user/link', 'https://github.com/:user', { redirect: true })
  .use(service, { owner: 'wayfin' })
  .listen(process.env.PORT || 3000);

waif.start();
