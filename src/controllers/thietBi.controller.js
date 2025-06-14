const ThietBiService = require('../services/thietBi.service');
const ResponseUtils = require('../utils/response');
const { validate, schemas } = require('../middlewares/validate');

class ThietBiController {
  static async createThietBi(req, res, next) {
    try {
      const thietBi = await ThietBiService.createThietBi(req.body);
      return res.status(201).json(
        ResponseUtils.success(thietBi, 'Equipment created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getThietBi(req, res, next) {
    try {
      const thietBi = await ThietBiService.getThietBiById(req.params.thietbi_id);
      return res.status(200).json(
        ResponseUtils.success(thietBi, 'Equipment retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateThietBi(req, res, next) {
    try {
      const thietBi = await ThietBiService.updateThietBi(req.params.thietbi_id, req.body);
      return res.status(200).json(
        ResponseUtils.success(thietBi, 'Equipment updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteThietBi(req, res, next) {
    try {
      await ThietBiService.deleteThietBi(req.params.thietbi_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Equipment deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ThietBiController;