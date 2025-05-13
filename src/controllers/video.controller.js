import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const filters = {};
    if (query) filters.title = { $regex: query, $options: "i" };
    if (userId) filters.owner = userId;

    const sortOptions = {};
    if (sortBy && sortType) sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(filters)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.json(new ApiResponse(200, videos));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoFile, thumbnail } = req.files;

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videoFilePath = await uploadOnCloudinary(videoFile[0].path);
    const thumbnailPath = await uploadOnCloudinary(thumbnail[0].path);

    const video = new Video({
        title,
        description,
        videoFile: videoFilePath,
        thumbnail: thumbnailPath,
        owner: req.user._id,
    });

    await video.save();
    res.status(201).json(new ApiResponse(201, video));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "-password -refreshToken");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.json(new ApiResponse(200, video));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnail = req.file;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const updateData = { title, description };
    if (thumbnail) {
        const thumbnailPath = await uploadOnCloudinary(thumbnail.path);
        updateData.thumbnail = thumbnailPath;
    }

    const video = await Video.findByIdAndUpdate(videoId, updateData, { new: true });
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.json(new ApiResponse(200, video));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.json(new ApiResponse(200, { message: "Video deleted successfully" }));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.json(new ApiResponse(200, video));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};

