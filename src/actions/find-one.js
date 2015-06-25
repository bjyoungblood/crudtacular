import Boom from 'boom';

// @todo implementation for fetching from child collections
export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model({
    id : request.params[settings.idParam],
  });

  let promise = model.fetch({
    require : true,
    withRelated : settings.withRelated,
  })
    .then(() => model.toJSON())
    .catch(settings.model.NotFoundError, () => {
      throw Boom.notFound();
    });

  reply(promise);
}
