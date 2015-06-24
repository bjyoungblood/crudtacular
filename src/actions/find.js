import Promise from 'bluebird';

// @todo implementation for fetching from child collections
function prepareModel(request) {
  let settings = request.route.settings.plugins.crudtacular;
  let model = new settings.model();

  let filters = request.getFilters();

  if (settings.pagination) {
    model.query((qb) => {
      let opts = request.getPaginationOptions();

      if (! opts.limit) {
        return;
      }

      qb.offset(opts.offset)
        .limit(opts.limit);
    });
  }

  if (settings.deletedAttr) {
    model.where(request.getDeletedAttrFilter());
  }

  model.where(filters);

  return model;
}

export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let promise = {};

  let results = prepareModel(request);

  if (settings.sorting) {
    let sort = request.getSortOptions();
    if (sort.sort) {
      results.query((qb) => {
        qb.orderBy(sort.sort, sort.dir);
      });
    }
  }

  promise.results = results.fetchAll({
    withRelated : settings.withRelated,
  });

  if (settings.count) {
    promise.count = prepareModel(request)
      .query((qb) => {
        qb.count();
      })
      .fetch();
  }

  Promise.props(promise)
    .then((resolved) => {
      let resp = reply(resolved.results.toJSON());

      if (resolved.count) {
        resp.header(settings.count.headerName, resolved.count.get('count'));
      }
    })
    .catch((err) => {
      console.log(err.stack);
      reply(err);
    });

}
