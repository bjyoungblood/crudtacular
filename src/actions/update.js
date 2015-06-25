import _ from 'lodash';
import Boom from 'boom';

// @todo implementation for child collections
export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model({
    id : request.params[settings.idParam],
  });

  let payload = _.omit(request.payload, 'id');

  let promise = model.fetch({
    require : true,
    withRelated : settings.withRelated,
  })
    .then(() => model.set(payload).save())
    .then(() => model.toJSON())
    .catch(settings.model.NotFoundError, () => {
      throw Boom.notFound();
    });

  reply(promise);
}
