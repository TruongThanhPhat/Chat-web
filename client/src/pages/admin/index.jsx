import React, { useEffect, useState } from "react";
import Background from "@/assets/login2.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showPasswords, setShowPasswords] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  // Chỉ cho phép chỉnh sửa tên của user
  const [editFormData, setEditFormData] = useState({
    fisrtName: "",
    lastName:"",
  });

  // Hàm lấy danh sách user từ API admin
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response && err.response.status === 401) {
        toast.error("Bạn không có quyền truy cập. Vui lòng đăng nhập lại.");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await apiClient.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      fetchUsers(); // Làm mới danh sách sau khi xóa
      toast.success("Xóa người dùng thành công!");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Xóa thất bại!");
    }
  };

  const toggleShowPassword = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Khi chọn nút "Sửa", chỉ cho phép chỉnh sửa tên của người dùng
  const startEditing = (user) => {
    setEditingUser(user._id);
    setEditFormData({
      fisrtName: user.name,
      lastName:user.name,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // Gửi chỉ field "name" để cập nhật
      await apiClient.put(`/api/admin/users/${editingUser}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setEditingUser(null);
      fetchUsers();
      toast.success("Cập nhật thành công!");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Cập nhật thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-gray-100">
      <div className="h-[90vh] w-[90vw] bg-white shadow-2xl rounded-3xl flex overflow-hidden">
        {/* Phần bên trái: Nội dung Dashboard */}
        <div className="flex-1 p-10 overflow-y-auto">
          <h1 className="text-4xl font-bold text-center mb-6">Admin Dashboard</h1>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="w-full flex justify-center gap-6 border-b-2 mb-6">
              <TabsTrigger
                value="users"
                className="text-lg text-gray-800 border-b-2 border-transparent 
                           data-[state=active]:border-purple-500 data-[state=active]:font-semibold transition-all duration-300"
              >
                Danh sách người dùng
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-lg text-gray-800 border-b-2 border-transparent 
                           data-[state=active]:border-purple-500 data-[state=active]:font-semibold transition-all duration-300"
              >
                Cài đặt
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="space-y-4">
              {/* Loại bỏ cột Ngày tạo, Ngày cập nhật */}
              <div className="grid grid-cols-4 gap-4 items-center p-2 bg-gray-800 text-white font-semibold rounded">
                <p>Tên</p>
                <p>Email</p>
                <p>Mật khẩu</p>
                <p>Hành động</p>
              </div>
              {users.map((user) => (
                <div
                  key={user._id}
                  className="grid grid-cols-4 gap-4 items-center p-2 border-b"
                >
                  <p className="text-center">{user.name ? user.name : user.email}</p>
                  <p className="text-center">{user.email}</p>
                  <p className="text-center flex items-center justify-center gap-1">
                    {showPasswords[user._id] ? user.password : "••••••"}
                    <Button
                      onClick={() => toggleShowPassword(user._id)}
                      variant="ghost"
                      size="sm"
                    >
                      {showPasswords[user._id] ? "Ẩn" : "Hiện"}
                    </Button>
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => deleteUser(user._id)}
                      variant="destructive"
                      size="sm"
                    >
                      Xóa
                    </Button>
                    <Button
                      onClick={() => startEditing(user)}
                      variant="secondary"
                      size="sm"
                    >
                      Sửa
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <p className="text-center">Chức năng cài đặt sẽ được cập nhật.</p>
            </TabsContent>
          </Tabs>
          {editingUser && (
            <div className="mt-6 p-6 border rounded-lg bg-gray-50">
              <h2 className="text-xl font-bold mb-4">
                Chỉnh sửa thông tin người dùng
              </h2>
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <Input
                  placeholder="Tên"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditChange}
                />
                <div className="flex gap-4">
                  <Button type="submit">Cập nhật</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
        {/* Phần bên phải: Hình nền (ẩn trên các màn hình nhỏ) */}
        <div className="hidden xl:flex items-center justify-center bg-gray-200">
          <img src={Background} alt="Background" className="h-[700px] object-contain" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
