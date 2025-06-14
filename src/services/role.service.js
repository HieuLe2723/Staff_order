const RoleModel = require('../models/role.model');

class RoleService {
  static async createRole({ role_name }) {
    if (!role_name) {
      throw new Error('Missing required field: role_name');
    }

    // Kiểm tra role_name đã tồn tại
    const existingRole = await RoleModel.findAll();
    if (existingRole.some(role => role.role_name === role_name)) {
      throw new Error('Role name already exists');
    }

    return await RoleModel.create({ role_name });
  }

  static async getRoleById(role_id) {
    const role = await RoleModel.findById(role_id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  static async getAllRoles() {
    return await RoleModel.findAll();
  }

  static async updateRole(role_id, { role_name }) {
    const role = await RoleModel.findById(role_id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (!role_name) {
      throw new Error('Missing required field: role_name');
    }

    // Kiểm tra role_name đã tồn tại
    const existingRole = await RoleModel.findAll();
    if (existingRole.some(r => r.role_name === role_name && r.role_id !== role_id)) {
      throw new Error('Role name already exists');
    }

    return await RoleModel.update(role_id, { role_name });
  }

  static async deleteRole(role_id) {
    const role = await RoleModel.findById(role_id);
    if (!role) {
      throw new Error('Role not found');
    }

    return await RoleModel.delete(role_id);
  }
}

module.exports = RoleService;