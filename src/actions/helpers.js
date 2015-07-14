import _ from 'lodash';

function applyPagination(model, request) {
  let settings = request.route.settings.plugins.crudtacular;

  if (! settings.pagination) {
    return;
  }

  settings.model.query((qb) => {
    let offset = request.query.offset || 0;
    let limit = request.query.limit ? request.query.limit : settings.pagination.defaultLimit;

    if (settings.pagination.maxLimit && limit > settings.pagination.maxLimit) {
      limit = settings.pagination.maxLimit;
    }

    if (! limit) {
      return;
    }

    qb.offset(Number(offset))
      .limit(Number(limit));
  });
}

function applyFilters(model, request) {
  const settings = request.route.settings.plugins.crudtacular;

  if (! settings.filtering) {
    return;
  }

  let filters = _.omit(request.query, 'sort', 'dir', 'offset', 'limit');

  if (settings.filtering && settings.filtering.whitelist.length) {
    filters = _.pick(filters, settings.filtering.whitelist);
  } else if (settings.filtering && settings.filtering.blacklist.length) {
    filters = _.omit(filters, settings.filtering.blacklist);
  }

  if (! filters) {
    return;
  }

  settings.model.query((qb) => {
    qb.where(filters);
  });
}

function applySorting(model, request) {
  let settings = request.route.settings.plugins.crudtacular;

  if (! settings.sorting) {
    return;
  }

  let sort = request.query.sort || settings.sorting.defaultField;
  let dir = request.query.dir || settings.sorting.defaultDirection;

  let allowedFields = settings.sorting.allowedFields;
  if (allowedFields.length && ! _.contains(allowedFields, sort)) {
    sort = settings.sorting.defaultField;
  }

  if (dir !== 'asc' && dir !== 'desc') {
    dir = settings.sorting.defaultDirection;
  }

  settings.model.query((qb) => {
    qb.orderBy(sort, dir);
  });
}

export default {
  applyPagination,
  applyFilters,
  applySorting,
};
