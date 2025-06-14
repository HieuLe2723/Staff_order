const PhienSuDungBanService = require('../services/phienSuDungBan.service');
const ResponseUtils = require('../utils/response');
const { validate, schemas } = require('../middlewares/validate');

class PhienSuDungBanController {
  static async createPhien(req, res, next) {
    try {
      const phien = await PhienSuDungBanService.createPhien(req.body);
      return res.status(201).json(
        ResponseUtils.success(phien, 'Table session created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getPhien(req, res, next) {
    try {
      const phien = await PhienSuDungBanService.getPhienById(req.params.phien_id);
      return res.status(200).json(
        ResponseUtils.success(phien, 'Table session retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updatePhien(req, res, next) {
    try {
      const phien = await PhienSuDungBanService.updatePhien(req.params.phien_id, req.body);
      return res.status(200).json(
        ResponseUtils.success(phien, 'Table session updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async endPhien(req, res, next) {
    try {
      const phien = await PhienSuDungBanService.endPhien(req.params.phien_id);
      return res.status(200).json(
        ResponseUtils.success(phien, 'Table session ended successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deletePhien(req, res, next) {
    try {
      await PhienSuDungBanService.deletePhien(req.params.phien_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Table session deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PhienSuDungBanController;