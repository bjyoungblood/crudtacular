import Promise from 'bluebird';

function prepareModel(request) {
  let settings = request.route.settings.plugins.crudtacular;
  let model = new settings.model();

  let filters = request.getFilters();

  if (settings.enablePagination) {
    model.query((qb) => {
      qb.offset(request.getPaginationOffset())
      .limit(request.getPaginationLimit());
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

  let countPromise = prepareModel(request).query((qb) => {
    qb.count();
  })
    .fetch()
    .then((result) => {
      return result;
    });

  let resultPromise = prepareModel(request).fetchAll({
    withRelated : settings.withRelated,
  });

  Promise.join(resultPromise, countPromise, (result, count) => {
    console.log(settings.countHeaderName, count.get('count'));
    reply(result).header(settings.countHeaderName, count.get('count'));
  }).catch((err) => {
    reply(err);
  });


}
