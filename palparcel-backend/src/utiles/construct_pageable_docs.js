/**
 * @method constructPageableDocs
 * @description  A function to create pageable docs
 */
const constructPageableDocs = (docs, option) => {
  let { skip = 0, page = 1, limit = 10, count = 0 } = option;

  skip = skip || (page - 1) * limit;
  page = Math.ceil((skip + 1) / limit);
  const offset = page * limit - limit;

  // Set default meta
  const meta = {
    docs: docs,
    page: page,
    limit: limit,
    offset: offset,
    totalPages: 0,
    prevPage: null,
    nextPage: null,
    totalDocs: count,
    pagingCounter: 0,
    hasPrevPage: false,
    hasNextPage: false,
  };

  const totalPages = limit > 0 ? Math.ceil(count / limit) || 1 : 0;
  meta.totalPages = totalPages;
  meta.pagingCounter = (page - 1) * limit + 1;

  // Set previous page
  if (page > 1) {
    meta.hasPrevPage = true;
    meta.prevPage = page - 1;
  } else if (page === 1 && offset !== 0) {
    meta.hasPrevPage = true;
    meta.prevPage = 1;
  }

  // Set next page
  if (page < totalPages) {
    meta.hasNextPage = true;
    meta.nextPage = page + 1;
  }

  if (limit === 0) {
    meta.limit = 0;
    meta.totalPages = 1;
    meta.page = 1;
    meta.pagingCounter = 1;
  }

  return meta;
};

module.exports = constructPageableDocs;
