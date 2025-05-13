import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    // Get total videos
    const totalVideos = await Video.countDocuments({ owner: channelId });

    // Get total video views
    const totalViews = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    // Get total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Get total likes
    const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: channelId }).select("_id") } });

    const response = new ApiResponse(200, {
        totalVideos,
        totalViews: totalViews[0] ? totalViews[0].totalViews : 0,
        totalSubscribers,
        totalLikes
    });

    res.json(response);
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Get all videos uploaded by the channel with pagination
    const videos = await Video.find({ owner: channelId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const response = new ApiResponse(200, videos);

    res.json(response);
});

export {
    getChannelStats, 
    getChannelVideos
}
