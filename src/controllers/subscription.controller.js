import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// controller to toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })

    if (existingSubscription) {
        await existingSubscription.remove()
        return res.json(new ApiResponse(200, { message: "Unsubscribed from channel" }))
    }

    await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    })
    res.json(new ApiResponse(200, { message: "Subscribed to channel" }))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await User.find({
        _id: {
            $in: await Subscription.distinct("subscriber", { channel: channelId })
        }
    }).select("-password -refreshToken")

    res.json(new ApiResponse(200, subscribers))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const subscribedChannels = await User.find({
        _id: {
            $in: await Subscription.distinct("channel", { subscriber: subscriberId })
        }
    }).select("-password -refreshToken")

    res.json(new ApiResponse(200, subscribedChannels))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
