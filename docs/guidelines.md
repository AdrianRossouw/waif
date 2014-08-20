# Guidelines

These are things to keep in mind when developing microservices for use with Waif.  

## Definition files keep the config out of services.

Each service may ship with zero or more service definition files.  

These files map out which services need to be made available, and allow  
you to assign names to each of these services.  

## Avoid module.exports, define a REST API instead.

Services are just express apps that export the app instead of calling listen().  

By not opening a port, you gain the flexibility of being able to mount the server  
anywhere. This gives Waif the flexibility to mount services intended for the  
network, over unix domain sockets to use as an internal API.  

## Doesn't matter where the service is running.

By using REST as the API layer, your services are no longer tied down.  

Whether you are calling your service via a socket attached to the same  
process, or a different process, or over tcp connecting to another machine,  
your service should be oblivious to it all.  

## Doesn't matter where the service files are on the file system.

Each service may ship with zero or more services of their own.  

You could have as many services as you have include files, and they could  
be in relative included files, relatively included submodule directories or  
installed from npm. It's even valid to have a service that just has a definition  
file containing a map of other services (although unlikely).  

## Consistent service names mean you can swap out implementations.

There may be multiple implementations for common service types.  

Store services are the one that come to mind here. By using a 'store' service  
to interact with our database, we gain the ability to swap out the mongodb  
store service, for a dummy implementation when writing tests.  

## Write custom services when you need something more specific.

Services are not meant to be a generalized solution to all problems.  

If you have a custom listing that you need to generate from mongo, build a  
simple service to return the JSON for you. You can include it in the service  
you are building it for's codebase and just use it internally. You still  
benefit from increased testability, reduced complexity and the ability  
to scale it out when you finally need to one day.  

## Populating credentials and configuration are out of scope.

This is a problem for the form of automated deployment you are using.  

Since running many services comes with an increase in deployment issues,  
you will need to figure out what works for service discovery for you.  

May I suggest [Longshoreman](http://longshoreman.io)?
