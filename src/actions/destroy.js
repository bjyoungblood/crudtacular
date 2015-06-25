import Boom from 'boom';

// @todo implementation for child collections
export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model({
    id : request.params[settings.idParam],
  });

  if (settings.deletedAttr) {
    model.where(request.getDeletedAttrFilter());
  }

  model.fetch({
    require : true,
    withRelated : settings.withRelated,
  })
    .then(() => {
      if (! settings.deletedAttr) {
        return model.destroy();
      }

      let deletedValue;
      if (settings.deletedAttrType === 'boolean') {
        deletedValue = true;
      } else {
        deletedValue = new Date();
      }

      return model.set({ [settings.deletedAttr] : deletedValue })
        .save();
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
