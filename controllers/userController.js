import userModel from "../models/User.js";

// CREATE USER
export const createUser = async (req, res) => {
    try {
        const user = await userModel.create(req.body);
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: users
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error retrieving users",
            error: error.message
        });
    }
};

// GET USER BY ID
export const getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: user
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error retrieving user",
            error: error.message
        });
    }
};

// UPDATE USER
export const updateUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndUpdate(req.params.id,
             req.body,
              { new: true,
                runValidators: true
               });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
};

// DELETE USER
export const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

export default {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};