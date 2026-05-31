import express from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../controllers/userController.js";

const router = express.Router();

router.post("/create-user", createUser);
router.get("/get-users", getAllUsers);
router.get("/user/:id", getUserById);
router.patch("/update-user/:id", updateUser);
router.delete("/user/:id", deleteUser);

export default router;
