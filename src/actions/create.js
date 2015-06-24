// @todo implementation for adding to child collections
export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let callback = function(err, payload) {
    if (err) {
      return reply(err);
    }

    let model = new settings.model(payload);

    return model
      .save()
      .then((savedModel) => {
        return savedModel.toJSON();
      })
      .nodeify(reply);
  };

  if (settings.transformPayload) {
    settings.transformPayload(request, callback);
  } else {
    callback(null, request.payload);
  }

}
