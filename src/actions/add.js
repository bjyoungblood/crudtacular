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
        .attach(request.params[settings.relationIdParam]);
    })
    .then(() => {
      reply({}).code(201);
    })
    .catch(settings.model.NotFoundError, () => {
      reply(Boom.notFound());
    })
    .catch((err) => {
      switch (err.code) {
        case '23505': // unique_violation
          reply(Boom.conflict());
          break;
        default:
          reply(err);
          break;
      }
    });
}
