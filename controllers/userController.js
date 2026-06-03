import mongoose from 'mongoose'
import userModel from '../models/User.js'
import roleModel from '../models/Role.js'
import Permission from '../models/Permission.js'
import bcrypt from 'bcryptjs'


export const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({message: "User already exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({email, password: hashedPassword, lastLogin: Date.now});

        return res.status(201).send({message: "User created successfully", user})
    } catch (error) {
        return res.status(500).send({message: "Error creating user", error})
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();

        return res.status(200).send({message: "Users fetched successfully", users})
    } catch (error) {
        return res.status(500).send({message: "Error fetching users", error})
    }
}

export const getUserById = async = (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).send({message: "User not found", error})
        }

        return res.status(200).send({message: "User fetched successfully", user})
    } catch (error) {
        return res.status(500).send({message: "Error fetching user", error})
    }
}

export const deactivateUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
        return res.status(200).send({message: "User deactivated successfully", user})
    } catch (error) {
        return res.status(500).send({message: "Error deactivating user", error})
    }
}

export const activateUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndUpdate(req.params.id, {active: true}, {new: true}); 
        return res.status(200).send({message: "User activated successfully", user})                                                                                                 
    } catch (error) {
        return res.status(500).send({message: "Error activating user", error})
    }
}