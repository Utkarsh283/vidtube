import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    // Return a simple OK status with a success message
    const response = new ApiResponse(200, { message: "OK" });
    res.json(response);
});

export { healthcheck };
