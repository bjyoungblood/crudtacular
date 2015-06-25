import Joi from 'joi';

import { getHandler } from './route-settings';
import pkg from '../package.json';

let handlerOptionsSchema = Joi.object().keys({

  // The Backbone model backing this endpoint
  model : Joi.func().required(),

  // The Backbone collection associated with the model
  collection : Joi.func().required(),

  // Any path prefix. If your path is `/api/users/1`, then the prefix would be `/api`
  pathPrefix : Joi.string().default(''),

  // Includes the given relations with the model; equivalent to calling
  // `Model.fetch({ withRelated : <items> })`
  withRelated : Joi.array().items(Joi.string()).default([]),

  filtering : Joi.alternatives().try(
    Joi.boolean().valid(false),
    Joi.object().keys({
      // Whitelisting allows you to define a set of fields that can be filtered on
      whitelist : Joi.array().items(Joi.string()),

      // Blacklisting allows you to define a set of fields that cannot be filtered on
      // If `whitelist` is specified, this option will be ignored
      blacklist : Joi.array().items(Joi.string()),
    })
  ).default({
    whitelist : [],
    blacklist : [],
  }),

  pagination : Joi.alternatives().try(
    Joi.boolean().valid(false),
    Joi.object().keys({
      // Sets the default items-per-page/limit if no limit is provided in the querystring
      defaultLimit : Joi.number().default(30),

      // Sets the maximum items-per-page/limit allowed in the querystring
      maxLimit : Joi.number(),
    })
  ).default({
    defaultLimit : 30,
  }),

  sorting : Joi.alternatives().try(
    Joi.boolean().valid(false),
    Joi.object().keys({
      // Sets the default sort field
      defaultField : Joi.string().default('id'),

      // Sets the default sort diresction
      defaultDirection : Joi.string().valid('asc', 'desc').default('asc'),

      // Sets a list of columns that can be sortable
      allowedFields : Joi.array().items(Joi.string()).default([]),
    })
  ).default({
    defaultField : 'id',
    defaultDirection : 'asc',
    allowedFields : [],
  }),

  count : Joi.alternatives().try(
    Joi.boolean().valid(false),
    Joi.object().keys({
      // Name of the header that contains the count of all records
      headerName : Joi.string().default('X-Count'),
    })
  ).default({
    headerName : 'X-Count',
  }),
});

function register(server, options, next) {

  server.handler('crudtacular', function crudtacularHandler(route, handlerOptions) {
    let validate = Joi.validate(handlerOptions, handlerOptionsSchema);
    if (validate.error) {
      throw validate.error;
    }

    handlerOptions = validate.value;

    let handler = getHandler(route, handlerOptions);
    return handler;
  });

  return next();
}

register.attributes = {
  name : pkg.name,
  version : pkg.version,
  multiple : false,
};

export default register;
