import Boom from 'boom';
import Promise from 'bluebird';
import helpers from './helpers';

function findCollection(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let promise = {};
  let model = new settings.model();

  helpers.applyPagination(model, request);
  helpers.applyFilters(model, request);
  helpers.applySorting(model, request);

  promise.results = model.fetchAll({
    withRelated : settings.withRelated,
  });

  if (settings.count) {
    let count = new settings.model();
    helpers.applyFilters(count, request);
    promise.count = count
      .query((qb) => {
        qb.count();
      })
      .fetch();
  }

  Promise.props(promise)
    .then((resolved) => {
      let resp = reply(resolved.results.toJSON({ omitPivot : true }));

      if (resolved.count) {
        resp.header(settings.count.headerName, resolved.count.get('count'));
      }
    })
    .catch((err) => {
      reply(err);
    });
}

function findChildCollection(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model({
    id : request.params[settings.idParam],
  });

  let promise = model.fetch({
    require : true,
  })
    .then(() => {
      let child = model.related(settings.relationName);

      helpers.applyPagination(child, request);
      helpers.applyFilters(child, request);
      helpers.applySorting(child, request);

      return child.fetch({
        withRelated : settings.withRelated,
      });
    })
    .then((relations) => {
      return relations.toJSON({
        omitPivot : true,
      });
    })
    .catch(settings.model.NotFoundError, () => {
      throw Boom.notFound();
    });

  reply(promise);
}

export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  if (settings.type === 'collection') {
    findCollection(request, reply);
  } else {
    findChildCollection(request, reply);
  }
}
