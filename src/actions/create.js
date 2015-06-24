// @todo implementation for adding to child collections
export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model(request.payload);

  return model
    .save()
    .then((savedModel) => {
      return savedModel.toJSON();
    })
    .nodeify(reply);

}
