module.exports = function paginate(model, populateField = '') {
  return async function (req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query = model.find().skip(skip).limit(limit);
      if (populateField) {
        query.populate(populateField);
      }

      const [data, total] = await Promise.all([
        query.exec(),
        model.countDocuments()
      ]);

      res.paginatedResults = {
        total,
        page,
        pages: Math.ceil(total / limit),
        data
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};
