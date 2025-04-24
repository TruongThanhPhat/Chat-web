import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import mongoose from "mongoose";


export const createChannel = async (request, response, next) => {
  try {
    const {name,members} = request.body;
    const userId = request.userId;

    const admin = await User.findById(userId);
    if(!admin){
        return response.status(400).send("Admin không tìm thấy")
    }

    const validMembers = await User.find({_id: {$in: members}});

    if(validMembers.length !== members.length){
        return response.status(400).send("một số thành viên không phải là người dùng hợp lệ");
    }
    const newChannel = new Channel({
        name,
        members,
        admin: userId,
    });

    await newChannel.save();
    return response.status(201).json({ channel: newChannel});
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getUserChannels = async (request, response, next) => {
    try {
      // Kiểm tra userId được set trong middleware xác thực
      if (!request.userId) {
        return response.status(400).send("Missing userId");
      }
      const userId = new mongoose.Types.ObjectId(request.userId);
      const channels = await Channel.find({
        $or: [{ admin: userId }, { members: userId }],
      }).sort({ updatedAt: -1 });
      return response.status(200).json({ channels });
    } catch (error) {
      console.error("Error in getUserChannels:", error);
      return response.status(500).send("Internal Server Error");
    }
  };
  
  export const getChannelMessages = async (request, response, next) => {
    try {
      const { channelId } = request.params;
      const channel = await Channel.findById(channelId).populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "firstName lastName email _id image color",
        },
      });
      if (!channel) {
        return response.status(404).send("Channel not found");
      }
      const messages = channel.messages;
      return response.status(200).json({ messages });
    } catch (error) {
      console.error("Error in getChannelMessages:", error);
      return response.status(500).send("Internal Server Error");
    }
  };

  export const getChannelMembers = async (request, response, next) => {
    try {
      const { channelId } = request.params;
      const channel = await Channel.findById(channelId).populate(
        "members",
        "firstName lastName email _id image color" // chọn các trường cần thiết
      );
      if (!channel) {
        return response.status(404).json({ message: "Channel not found" });
      }
      const members = channel.members;
      return response.status(200).json({ members });
    } catch (error) {
      console.error("Error in getChannelMembers:", error);
      return response.status(500).json({ message: "Internal Server Error" });
    }
  };
  