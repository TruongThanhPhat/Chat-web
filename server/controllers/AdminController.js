// AdminController.js
import User from "../models/UserModel.js";

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Cập nhật thông tin người dùng theo id (chỉ cập nhật tên)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Tên không được để trống" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true } // Trả về phiên bản đã cập nhật và chạy validator nếu có
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Xóa người dùng theo id
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    return res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
