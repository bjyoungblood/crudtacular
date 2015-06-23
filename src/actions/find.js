import Promise from 'bluebird';

function prepareModel(request) {
  let settings = request.route.settings.plugins.crudtacular;
  let model = new settings.model();

  let filters = request.getFilters();

  if (settings.enablePagination) {
    model.query((qb) => {
      let limit = request.getPaginationLimit();

      if (! limit) {
        return;
      }

      qb.offset(request.getPaginationOffset())
        .limit(limit);
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

  if (settings.enableSorting) {
    let sort = request.getSort();
    if (sort.sort) {
      results.query((qb) => {
        qb.orderBy(sort.sort, sort.dir);
      });
    }
  }

  promise.results = results.fetchAll({
    withRelated : settings.withRelated,
  });

  if (settings.includeCount) {
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
        resp.header(settings.countHeaderName, resolved.count.get('count'));
      }
    })
    .catch((err) => {
      reply(err);
    });

}
