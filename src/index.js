import _ from 'lodash';
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

  // Using a deleted attribute, you can define a field in your table (e.g., is_deleted)
  // which will determine whether the record should be included in resultsets.
  // This option controls the naming of the field.
  deletedAttr : Joi.string().optional(),

  // Controls the type of the deleted attribute. Boolean could be used for fields
  // like is_deleted = true/false; timestamp could be used for deleted_at = NOW()
  deletedAttrType : Joi.allow([ 'boolean', 'timestamp' ]).default('boolean'),

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

  server.decorate('request', 'getFilters', function getFilters() {
    const settings = this.route.settings.plugins.crudtacular;
    if (! settings) {
      return this.query;
    }

    let filters = this.query;

    if (settings.deletedAttr) {
      filters = _.omit(filters, settings.deletedAttr);
    }

    if (settings.pagination) {
      filters = _.omit(filters, 'offset', 'limit');
    }

    if (settings.sorting) {
      filters = _.omit(filters, 'sort', 'dir');
    }

    if (settings.filtering && settings.filtering.whitelist.length) {
      filters = _.pick(filters, settings.filtering.whitelist);
    } else if (settings.filtering && settings.filtering.blacklist.length) {
      filters = _.omit(filters, settings.filtering.blacklist);
    }

    return filters;
  });

  server.decorate('request', 'getPaginationOptions', function getPaginationOptions() {
    const settings = this.route.settings.plugins.crudtacular;
    if (! settings.pagination) {
      return false;
    }

    let offset = this.query.offset || 0;
    let limit = this.query.limit ? this.query.limit : settings.pagination.defaultLimit;

    if (settings.pagination.maxLimit && limit > settings.pagination.maxLimit) {
      limit = settings.pagination.maxLimit;
    }

    return {
      offset : Number(offset),
      limit : Number(limit),
    };
  });

  server.decorate('request', 'getDeletedAttrFilter', function getDeletedAttrFilter() {
    const settings = this.route.settings.plugins.crudtacular;

    let notDeletedValue;

    if (settings.deletedAttrType === 'boolean') {
      notDeletedValue = false;
    } else {
      notDeletedValue = null;
    }

    return {
      [ settings.deletedAttr ] : notDeletedValue,
    };
  });

  server.decorate('request', 'getSortOptions', function getSortOptions() {
    const settings = this.route.settings.plugins.crudtacular;

    let sort = this.query.sort || settings.sorting.defaultField;
    let dir = this.query.dir || settings.sorting.defaultDirection;

    let allowedFields = settings.sorting.allowedFields;
    if (allowedFields.length && ! _.contains(allowedFields, sort)) {
      sort = settings.sorting.defaultField;
    }

    if (dir !== 'asc' && dir !== 'desc') {
      dir = settings.sorting.defaultDirection;
    }

    return {
      sort,
      dir,
    };
  });

  return next();
}

register.attributes = {
  name : pkg.name,
  version : pkg.version,
  multiple : false,
};

export default register;
