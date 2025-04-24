import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES, GET_CHANNEL_MEMBERS, HOST } from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const MessageContainer = () => {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    showChannelMembers,
    setShowChannelMembers,
  } = useAppStore();

  const [channelMembers, setChannelMembers] = useState([]);
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  // Lấy tin nhắn cho chat DM hoặc Channel
  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    if (selectedChatData && selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMessages();
      } else if (selectedChatType === "channel") {
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  // Lấy danh sách thành viên của channel
  useEffect(() => {
    const getMembers = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MEMBERS}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.members) {
          setChannelMembers(response.data.members);
        }
      } catch (error) {
        console.log({ error });
      }
    };

    if (selectedChatType === "channel" && selectedChatData && selectedChatData._id) {
      getMembers();
    }
  }, [selectedChatData, selectedChatType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const downloadFile = async (url) => {
    const response = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
  };

  // Hàm render tin nhắn
  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  // Render tin nhắn DM
  const renderDMMessages = (message) => (
    <div
      className={`${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender === selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender === selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                setShowImage(true);
                setImageURL(message.fileUrl);
              }}
            >
              <img
                src={`${HOST}/${message.fileUrl}`}
                height={200}
                width={200}
                alt="Uploaded file"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span className="text-white text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />
              </span>
              <span>{message.fileUrl.split("/").pop()}</span>
              <span
                className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  // Render tin nhắn channel (Group messages)
  const renderChannelMessages = (message) => {
    const isCurrentUser = message.sender._id === userInfo.id;
    return (
      <div className={`mt-5 ${isCurrentUser ? "text-right" : "text-left"}`}>
        {message.messageType === "text" && (
          <div
            className={`${
              isCurrentUser
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              isCurrentUser
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl}`}
                  height={200}
                  width={200}
                  alt="Uploaded file"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {/* Hiển thị thông tin người gửi */}
        {!isCurrentUser ? (
          <div className="mt-1 flex items-center gap-2">
            <Avatar className="h-6 w-6 rounded-full overflow-hidden">
              {message.sender.image ? (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <AvatarFallback
                  className={`uppercase h-6 w-6 text-sm border flex items-center justify-center rounded-full ${getColor(
                    message.sender.color
                  )}`}
                >
                  {message.sender.firstName && message.sender.lastName
                    ? `${message.sender.firstName.charAt(0)}${message.sender.lastName.charAt(0)}`
                    : message.sender.email.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-xs text-white/60">
              {message.sender.firstName && message.sender.lastName
                ? `${message.sender.firstName} ${message.sender.lastName}`
                : message.sender.email}
            </span>
            <span className="text-xs text-white/60">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        ) : (
          <div className="mt-1 text-xs text-white/60">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {/* Nếu là chat nhóm và đã bật chế độ hiển thị thành viên, hiển thị khung member */}
      {selectedChatType === "channel" && showChannelMembers && (
        <div className="absolute top-2 right-2 bg-[#1b1c24] border border-gray-600 rounded-md p-3 w-64 z-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Danh sách thành viên </h2>
            <Button onClick={() => setShowChannelMembers(false)} className="text-xs">
             Đóng
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {channelMembers.map((member) => (
              <div key={member._id} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {member.image ? (
                    <AvatarImage
                      src={`${HOST}/${member.image}`}
                      alt={member.firstName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <AvatarFallback className="h-6 w-6 text-xs">
                      {member.firstName && member.lastName
                        ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                        : member.email.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-xs text-gray-300">
                  {member.firstName && member.lastName
                    ? `${member.firstName} ${member.lastName}`
                    : member.email}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[100] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img
              src={`${HOST}/${imageURL}`}
              className="h-[80vh] w-full object-cover"
              alt="Large Display"
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageURL)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
