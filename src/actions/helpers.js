function applyPagination(model, request) {
  let settings = request.route.settings.plugins.crudtacular;

  if (settings.pagination) {
    model.query((qb) => {
      let opts = request.getPaginationOptions();

      if (! opts.limit) {
        return;
      }

      qb.offset(opts.offset)
        .limit(opts.limit);
    });
  }
}

function applyFilters(model, request) {
  model.where(request.getFilters());
}

function applySorting(model, request) {
  let settings = request.route.settings.plugins.crudtacular;

  if (settings.sorting) {
    let sort = request.getSortOptions();
    if (sort.sort) {
      model.query((qb) => {
        qb.orderBy(sort.sort, sort.dir);
      });
    }
  }
}

export default {
  applyPagination,
  applyFilters,
  applySorting,
};
