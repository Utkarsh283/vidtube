import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const comments = await Comment.find({video: videoId})
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("owner", "-password -refreshToken")
        .sort({createdAt: -1})
    res.json(comments)
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
    })
    res.json(comment)
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body
    const comment = await Comment.findByIdAndUpdate(commentId, {content}, {new: true})
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    res.json(comment)
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    res.json({message: "Comment deleted successfully"})
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}

