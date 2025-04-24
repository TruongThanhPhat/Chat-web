import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { RiCloseFill } from "react-icons/ri";
import { HOST } from "@/utils/constants";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType, setShowChannelMembers } = useAppStore();

  if (!selectedChatData) {
    return (
      <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-center px-20">
        <span className="text-gray-500">Không tìm thấy liên hệ</span>
      </div>
    );
  }

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center w-full">
          <div className="w-12 h-12 relative">
            {selectedChatType === "contact" ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                {selectedChatData?.image ? (
                  <AvatarImage
                    src={`${HOST}/${selectedChatData.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border flex items-center justify-center rounded-full ${getColor(
                      selectedChatData?.color || 0
                    )}`}
                  >
                    {selectedChatData?.firstName
                      ? selectedChatData.firstName.charAt(0)
                      : selectedChatData?.email?.charAt(0)}
                  </div>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] h-12 w-12 flex items-center justify-center rounded-full">
                Nhóm
              </div>
            )}
          </div>
          <div>
            {selectedChatType === "channel" && selectedChatData.name}
            {selectedChatType === "contact" &&
              (selectedChatData.firstName
                ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                : selectedChatData.email)}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          {selectedChatType === "channel" && (
            <Button
              className="text-neutral-500 bg-[#33CCFF] hover:bg-green-600 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
              onClick={() => setShowChannelMembers(true)}
            >
              Thành viên
            </Button>
          )}
          <Button
            className="text-neutral-500 bg-[#00FFFF] hover:bg-cyan-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={closeChat}
          >
            <RiCloseFill className="text-3xl" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
