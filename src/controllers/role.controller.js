const RoleService = require('../services/role.service');
const ResponseUtils = require('../utils/response');
const { validate, schemas } = require('../middlewares/validate');

class RoleController {
  static async createRole(req, res, next) {
    try {
      const role = await RoleService.createRole(req.body);
      return res.status(201).json(
        ResponseUtils.success(role, 'Role created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getRole(req, res, next) {
    try {
      const role = await RoleService.getRoleById(req.params.role_id);
      return res.status(200).json(
        ResponseUtils.success(role, 'Role retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAllRoles(req, res, next) {
    try {
      const roles = await RoleService.getAllRoles();
      return res.status(200).json(
        ResponseUtils.success(roles, 'All roles retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateRole(req, res, next) {
    try {
      const role = await RoleService.updateRole(req.params.role_id, req.body);
      return res.status(200).json(
        ResponseUtils.success(role, 'Role updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteRole(req, res, next) {
    try {
      await RoleService.deleteRole(req.params.role_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Role deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RoleController;