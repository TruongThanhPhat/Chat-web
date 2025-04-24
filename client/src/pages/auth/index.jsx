import Background from "@/assets/login2.png"; 
import Victory from "@/assets/victory.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const Auth = () => {
    const navigate = useNavigate()
    const {setUserInfo} = useAppStore();
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [confirmPassword,setConfirmPassword] = useState("");

    const validateLogin = ()=>{
      if(!email.length){
        toast.error("Yêu cầu email.");
        return false;
      }
      if(!password.length){
        toast.error("Yêu cầu mật khẩu");
        return false;
      }
      return true;
    }
    const validateSignup = () => {
      if(!email.length){
        toast.error("Yêu cầu email.");
        return false;
      }
      if(!password.length){
        toast.error("Yêu cầu mật khẩu");
        return false;
      }
      if(password !== confirmPassword){
        toast.error("Mật khẩu và mật khẩu xác nhận phải giống nhau!");
        return false;
      }
      return true;
    }
    const handleLogin = async() =>{
      if(validateLogin()){
        const response = await apiClient.post(
          LOGIN_ROUTE,
          {email,password},
          {withCredentials:true}
        );
        if(response.data.user.id){
          setUserInfo(response.data.user)
          if(response.data.user.profileSetup) navigate("/chat");
          else navigate("/profile");
        }
        console.log({response});
      }
    };
    const handleSignup = async () => {
      if (validateSignup()) {
        try {
          const response = await apiClient.post(SIGNUP_ROUTE, { email, password },{withCredentials:true});
          if(response.status === 201){
            setUserInfo(response.data.user)
            navigate("/profile");
          }
          console.log("Signup success:", response.data);
          toast.success("Đăng ký thành công!");
        } catch (error) {
          console.error("Signup failed:", error.response?.data || error.message);
          toast.error(error.response?.data || "Đăng ký thất bại, thử lại!");
        }
      }
    };
    

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl 
                      w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl 
                      flex items-center justify-center">
        
        {/* Cột trái - Nội dung chào mừng (Căn giữa) */}
        <div className="flex flex-col gap-10 items-center justify-center h-full">
          
          {/* Tiêu đề "Welcome ✌️" */}
          <div className="flex items-center justify-center flex-col text-center">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="Victory Emoji" className="h-[50px] ml-2" />
            </div>
            <p className="font-medium text-gray-600">
              Fill in the details to get started with the best chat app!
            </p>
          </div>

          {/* Tabs Login / Signup - Căn giữa hoàn hảo */}
          <div className="w-full flex justify-center">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="w-full flex justify-center gap-6 border-b-2">
                <TabsTrigger 
                  value="login" 
                  className="text-black text-opacity-90 border-b-2 border-transparent 
                             rounded-none w-full data-[state=active]:border-purple-500 
                             data-[state=active]:font-semibold transition-all duration-300">
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-black text-opacity-90 border-b-2 border-transparent 
                             rounded-none w-full data-[state=active]:border-purple-500 
                             data-[state=active]:font-semibold transition-all duration-300">
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-10" value="login">
              <Input 
                placeholder="Email" 
                type="email" 
                className="rounded-full p-6"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} />
                <Input 
                placeholder="Password" 
                type="password" 
                className="rounded-full p-6"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} />
                <Button className="rounded-full p-6" onClick={handleLogin}>Đăng nhập</Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5 mt-10" value="signup">
              <Input 
                placeholder="Email" 
                type="email" 
                className="rounded-full p-6"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} />
                <Input 
                placeholder="Password" 
                type="password" 
                className="rounded-full p-6"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} />
                <Input 
                placeholder="Confirm Password" 
                type="password" 
                className="rounded-full p-6"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} />
                <Button className="rounded-full p-6" onClick={handleSignup}>Đăng Ký</Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="background login" className="h-[700px"/>
        </div>
      </div>
    </div>
  );
};

export default Auth;
