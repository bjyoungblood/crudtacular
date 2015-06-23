import _ from 'lodash';
import Joi from 'joi';

import { getHandler } from './route-settings';
import pkg from '../package.json';

let handlerOptionsSchema = Joi.object().keys({

  // The Backbone model backing this endpoint
  model : Joi.func().required(),

  // The Backbone collection associated with the model
  collection : Joi.func().required(),

  pathPrefix : Joi.string().default(''),

  // Using a deleted attribute, you can define a field in your table (e.g., is_deleted)
  // which will determine whether the record should be included in resultsets.
  // This option controls the naming of the field.
  deletedAttr : Joi.string().optional(),

  // Controls the type of the deleted attribute. Boolean could be used for fields
  // like is_deleted = true/false; timestamp could be used for deleted_at = NOW()
  deletedAttrType : Joi.allow([ 'boolean', 'timestamp' ]).default('boolean'),

  // Whitelisting allows you to define a set of fields that can be filtered on
  filterWhitelist : Joi.array().items(Joi.string()),

  // Blacklisting allows you to define a set of fields that cannot be filtered on
  // If `filterWhitelist` is specified, this option will be ignored
  filterBlacklist : Joi.array().items(Joi.string()),

  // Set false to disable pagination
  enablePagination : Joi.boolean().default(true),

  // Sets the default items-per-page/limit if no limit is provided in the querystring
  limit : Joi.number().default(30),

  // Sets the maximum items-per-page/limit allowed in the querystring
  maxLimit : Joi.number(),

  // Includes the given relations with the model; equivalent to calling
  // `Model.fetch({ withRelated : <items> })`
  withRelated : Joi.array().items(Joi.string()).default([]),

  // Includes a count of all records that match the filters as a header (named
  // X-Count by default)
  includeCount : Joi.boolean().default(false),

  // Name of the header that contains the count of all records
  countHeaderName : Joi.string().default('X-Count'),
});

function register(server, options, next) {

  server.handler('crudtacular', function(route, handlerOptions) {
    let validate = Joi.validate(handlerOptions, handlerOptionsSchema);
    if (validate.error) {
      throw validate.error;
    }

    handlerOptions = validate.value;

    let handler = getHandler(route);
    _.merge(route.settings.plugins.crudtacular, handlerOptions);
    return handler;
  });

  server.decorate('request', 'getFilters', function() {
    const settings = this.route.settings.plugins.crudtacular;
    if (! settings) {
      return this.query;
    }

    let filters = this.query;

    if (settings.deletedAttr) {
      filters = _.omit(filters, settings.deletedAttr);
    }

    if (settings.enablePagination) {
      filters = _.omit(filters, 'offset', 'limit');
    }

    if (settings.filterWhitelist) {
      filters = _.pick(filters, settings.filterWhitelist);
    } else if (settings.filterBlacklist) {
      filters = _.omit(filters, settings.filterBlacklist);
    }

    return filters;
  });

  server.decorate('request', 'getPaginationOffset', function() {
    return Number(this.query.offset) || 0;
  });

  server.decorate('request', 'getPaginationLimit', function() {
    const settings = this.route.settings.plugins.crudtacular;

    let limit = this.query.limit ? this.query.limit : settings.limit;

    if (settings.maxLimit && limit > settings.maxLimit) {
      limit = settings.maxLimit;
    }

    return Number(limit);
  });

  server.decorate('request', 'getDeletedAttrFilter', function() {
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

  return next();
}

register.attributes = {
  name : pkg.name,
  version : pkg.version,
  multiple : false,
};

export default register;
