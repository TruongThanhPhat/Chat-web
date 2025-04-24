// AdminRoutes.js
import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getAllUsers, updateUser, deleteUser } from "../controllers/AdminController.js";

const adminRoutes = Router();

// Lấy danh sách người dùng: GET /api/admin/users
adminRoutes.get("/users", verifyToken, getAllUsers);

// Cập nhật thông tin người dùng: PUT /api/admin/users/:id
adminRoutes.put("/users/:id", verifyToken, updateUser);

// Xóa người dùng: DELETE /api/admin/users/:id
adminRoutes.delete("/users/:id", verifyToken, deleteUser);

export default adminRoutes;
