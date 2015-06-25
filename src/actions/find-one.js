import Boom from 'boom';

function findOneModel(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model({
    id : request.params[settings.idParam],
  });

  let promise = model.fetch({
    require : true,
    withRelated : settings.withRelated,
  })
    .then(() => model.toJSON({ omitPivot : true }))
    .catch(settings.model.NotFoundError, () => {
      throw Boom.notFound();
    });

  reply(promise);
}

function findOneChild(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model({
    id : request.params[settings.idParam],
  });

  let promise = model.fetch({
    require : true,
  })
    .then(() => {
      let child = model.related(settings.relationName);

      child.query((qb) => {
        qb.where({
          id : request.params[settings.relationIdParam],
        });
      });

      return child
        .fetchOne({
          require : true,
          withRelated : settings.withRelated,
        })
        .catch(child.model.NotFoundError, () => {
          throw Boom.notFound();
        });
    })
    .then((child) => child.toJSON({ omitPivot : true }))
    .catch(settings.model.NotFoundError, () => {
      throw Boom.notFound();
    });

  reply(promise);
}

export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  if (settings.type === 'model') {
    findOneModel(request, reply);
  } else {
    findOneChild(request, reply);
  }
}
