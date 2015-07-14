import _ from 'lodash';

function applyPagination(model, request) {
  let settings = request.route.settings.plugins.crudtacular;

  if (! settings.pagination) {
    return;
  }

  model.query((qb) => {

    let offset;
    let limit;

    if (settings.pagination.style === 'offset') {
      offset = request.query.offset || 0;
      limit = request.query.limit ? request.query.limit : settings.pagination.defaultLimit;

      if (settings.pagination.maxLimit && limit > settings.pagination.maxLimit) {
        limit = settings.pagination.maxLimit;
      }
    } else {
      limit = request.query.per_page ? request.query.per_page : settings.pagination.defaultLimit;

      if (settings.pagination.maxLimit && limit > settings.pagination.maxLimit) {
        limit = settings.pagination.maxLimit;
      }

      offset = (request.query.page - 1) * limit;
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

  let filters = request.query;

  console.log(settings.pagination);
  if (settings.pagination) {
    if (settings.pagination.style === 'offset') {
      filters = _.omit(filters, 'offset', 'limit');
    } else {
      filters = _.omit(filters, 'page', 'per_page');
    }
  }

  if (settings.sorting) {
    filters = _.omit(filters, 'sort', 'dir');
  }

  if (settings.filtering && settings.filtering.whitelist.length) {
    filters = _.pick(filters, settings.filtering.whitelist);
  } else if (settings.filtering && settings.filtering.blacklist.length) {
    filters = _.omit(filters, settings.filtering.blacklist);
  }

  if (! filters) {
    return;
  }

  model.query((qb) => {
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

  model.query((qb) => {
    qb.orderBy(sort, dir);
  });
}

export default {
  applyPagination,
  applyFilters,
  applySorting,
};
