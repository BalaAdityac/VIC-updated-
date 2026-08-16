const catchAsync = require("../../utils/catchAsync");
const { sendSuccess } = require("../../utils/response.util");
const authService = require("./auth.service");

const register = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await authService.register({ email, password, role });
  return sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful.",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return sendSuccess(res, {
    statusCode: 200,
    message: "Login successful.",
    data: result,
  });
});

const getCurrentUser = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, {
    statusCode: 200,
    message: "Current user fetched successfully.",
    data: { user },
  });
});

const updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.updatePassword(req.user.id, { currentPassword, newPassword });
  return sendSuccess(res, {
    statusCode: 200,
    message: "Password updated successfully.",
    data: { user },
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  return sendSuccess(res, {
    statusCode: 200,
    message: result.message,
    data: null,
  });
});

const logout = catchAsync(async (req, res) => {
  const result = await authService.logout(req.user?.id);
  return sendSuccess(res, {
    statusCode: 200,
    message: result.message,
    data: null,
  });
});

module.exports = {
  register,
  login,
  getCurrentUser,
  updatePassword,
  forgotPassword,
  logout,
};
