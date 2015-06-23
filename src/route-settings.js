import Call from 'call';

import actions from './actions';

const router = new Call.Router({});

function parseCrudPath(path) {
  let segments = router.analyze(path).segments;

  let test;
  let type;
  let collection;
  let idParam;
  let relationName;
  let relationIdParam;

  switch (segments.length) {
    case 1:
      test = segments[0].literal;
      type = 'collection';
      break;
    case 2:
      test = segments[0].literal && segments[1].name;
      type = 'model';
      break;
    case 3:
      test = segments[0].literal && segments[1].name && segments[2].literal;
      type = 'relatedCollection';
      break;
    case 4:
      test = segments[0].literal && segments[1].name && segments[2].literal && segments[3].name;
      type = 'relatedModel';
      break;
    default:
      test = false;
      break;
  }

  if (! test) {
    throw new Error('Invalid CRUD path: ' + path);
  }

  switch (segments.length) {
    case 4:
      relationIdParam = segments[3].name;
      /* falls through */
    case 3:
      relationName = segments[2].literal;
      /* falls through */
    case 2:
      idParam = segments[1].name;
      /* falls through */
    case 1:
      collection = segments[0].literal;
      break;
    default:
      /* unreachable */
  }

  return {
    type,
    collection,
    idParam,
    relationName,
    relationIdParam,
  };
}

function get(route) {
  switch (route.settings.plugins.crudtacular.type) {
    case 'collection':
    case 'relatedCollection':
      return actions.find;
    case 'model':
    case 'relatedModel':
      return actions.findOne;
    default:
      throw new Error('Invalid route path for crud: ', route.path);
  }
}

function post(route) {
  switch (route.settings.plugins.crudtacular.type) {
    case 'collection':
    case 'relatedCollection':
      return actions.create;
    case 'relatedModel':
      return actions.add;
    default:
      throw new Error('Invalid route path for crud: ', route.path);
  }
}

function put(route) {
  switch (route.settings.plugins.crudtacular.type) {
    case 'model':
    case 'relatedModel':
      return actions.update;
    default:
      throw new Error('Invalid route path for crud: ', route.path);
  }
}

function destroy(route) {
  switch (route.settings.plugins.crudtacular.type) {
    case 'model':
      return actions.destroy;
    case 'relatedModel':
      return actions.remove;
    default:
      throw new Error('Invalid route path for crud: ', route.path);
  }
}

export function getHandler(route) {
  route.settings.plugins.crudtacular = parseCrudPath(route.path);

  switch (route.method) {
    case 'get':
      return get(route);
    case 'post':
      return post(route);
    case 'put':
    case 'patch':
      return put(route);
    case 'delete':
      return destroy(route);
    default:
      throw new Error('Invalid HTTP method for crud: ', route.method);
  }
}
