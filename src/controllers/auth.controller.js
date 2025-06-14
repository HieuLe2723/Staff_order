// src/controllers/auth.controller.js
const AuthService = require('../services/auth.service');
const ResponseUtils = require('../utils/response');

class AuthController {
  static async login(req, res) {
    console.log('Login request received:', req.body); // Log debug
    try {
      const { nhanvien_id, password } = req.body;
      const result = await AuthService.login(nhanvien_id, password);
      const response = ResponseUtils.success(result, 'Login successful');
      res.status(200).json(response);
    } catch (err) {
      console.error('Login error:', err.message); // Log error
      const response = ResponseUtils.error(err.message, 400);
      res.status(400).json(response);
    }
  }

  static async refreshToken(req, res) {
    console.log('Refresh token request received'); // Log debug
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }
      const result = await AuthService.refreshToken(refreshToken);
      const response = ResponseUtils.success(result, 'Token refreshed successfully');
      res.status(200).json(response);
    } catch (err) {
      console.error('Refresh token error:', err.message); // Log error
      const response = ResponseUtils.error(err.message, 401);
      res.status(401).json(response);
    }
  }
}

module.exports = AuthController;