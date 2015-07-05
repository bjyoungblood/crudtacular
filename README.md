# About

Crudtacular is a Hapi plugin that automatically bridges all the Model/Collection Bookshelf logic
that a developer usually has to write in custom handlers.

With Crudtacular, you define crudtacular as the handler itself in your route definitions and
simple CRUD routes are ready to go without additional setup.

# NPM Installation

`npm install crudtacular`

# Hapi Plugin Integration

When defining your Hapi plugins, require the following file and add it to the array
of plugins that Hapi should use.

export default function(server) {
  return server.registerAsync({
    register : require('crudtacular'),
  });
}

# Examples

From any of your Hapi routes, you can define the following handler

```
const handler = {
  crudtacular : {
    pathPrefix : '/api',
    model : User.Model,
    collection : User.Collection,
  },
};

```

From there, in your individual route definitions, use the new handler.
You can include pre functions, if desired, to supplement query parameters
or check that the user has the correct permissions to actually call the function.

```
server.route({
  path : `/api/users`,
  method : 'GET',
  handler : handler,
  config : {
    description : 'Fetch all users',
  },
});

server.route({
  path : `/api/users/{userId}`,
  method : 'GET',
  handler : handler,
  config : {
    description : 'Fetch user',
  },
});

server.route({
  path : `/api/users`,
  method : 'POST',
  handler : handler,
  config : {
    description : 'Add new user',
  },
});

server.route({
  path : `/api/users/{userId}`,
  method : 'UPDATE',
  handler : handler,
  config : {
    pre : [
      canUpdateUser,
    ],
    description : 'Update user if an admin or the user is himself',
  },
});

server.route({
  path : `/api/users/{userId}`,
  method : 'DELETE',
  handler : handler,
  config : {
    pre : [
      canDeleteUser,
    ],
    description : 'Delete user if an admin or the user is himself',
  },
});

```
