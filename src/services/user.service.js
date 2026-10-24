import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const createUserService = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 400;
    throw error;
  }

  // Hash password if provided
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }

  const user = await User.create(userData);
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const getAllUsersService = async (filters = {}) => {
  const query = {};

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.role) {
    query.role = filters.role;
  }

  if (typeof filters.isActive !== "undefined") {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }

  const users = await User.find(query).select("-password").sort({ createdAt: -1 });
  return users;
};

export const getUserByIdService = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const updateUserService = async (id, updateData) => {
  // If updating password, hash it
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const deleteUserService = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return { message: "User deleted successfully", id };
};

