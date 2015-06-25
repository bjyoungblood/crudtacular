import Boom from 'boom';

export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model({
    id : request.params[settings.idParam],
  });

  model.fetch({
    require : true,
    withRelated : settings.withRelated,
  })
    .then(() => {
      return model.destroy();
    })
    .then(() => {
      reply({}).code(204);
    })
    .catch(settings.model.NotFoundError, () => {
      reply(Boom.notFound());
    })
    .catch((err) => {
      reply(Boom.wrap(err));
    });
}
