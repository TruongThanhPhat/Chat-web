import { useAppStore } from "@/store"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EmptyChatContainer from "./components/empty-chat-container";
import ContactsContainer from "./components/contacts-container";
import ChatContainer from "./components/chat-container";





const Chat = () => {

  const { userInfo,selectedChatType } = useAppStore();
  const navigate = useNavigate();
  useEffect(() =>{
    if(!userInfo.profileSetup){
      toast("Hãy thiết lập hồ sơ của bạn để tiếp tục!");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

    return (
      <div className="flex h-[100vh] text-white overflow-hidden">
        <ContactsContainer/>
        {
          selectedChatType === undefined 
          ? (<EmptyChatContainer/>)
          :(<ChatContainer />)
        }
      </div>
    );
  };
  
export default Chat;