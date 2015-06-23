export default function(request, reply) {
  let settings = request.route.settings.plugins.crudtacular;

  let model = new settings.model();


  reply();
}
