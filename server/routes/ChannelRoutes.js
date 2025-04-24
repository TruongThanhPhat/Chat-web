import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { createChannel, getChannelMembers, getChannelMessages, getUserChannels } from "../controllers/ChannelController.js";


const channelRoutes = Router();

channelRoutes.post("/create-channel",verifyToken,createChannel);
channelRoutes.get("/get-user-channels", verifyToken,getUserChannels);
channelRoutes.get("/get-channel-messages/:channelId",verifyToken,getChannelMessages);
channelRoutes.get("/get-channel-members/:channelId", verifyToken, getChannelMembers);
export default channelRoutes;