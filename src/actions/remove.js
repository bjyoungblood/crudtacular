import Boom from 'boom';

export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model({
    id : request.params[settings.idParam],
  });

  model.fetch({
    require : true,
  })
    .then(() => {
      return model.related(settings.relationName)
        .detach(request.params[settings.relationIdParam]);
    })
    .then(() => {
      reply({}).code(204);
    })
    .catch(settings.model.NotFoundError, (err) => {
      console.log(err.stack);
      reply(Boom.notFound());
    })
    .catch(reply);
}
