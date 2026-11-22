import express from "express";

import {
    createMentorshipRequest,
    getSentMentorshipRequests,
    getReceivedMentorshipRequests,
    acceptMentorshipRequest,
    declineMentorshipRequest,
    cancelMentorshipRequest,
} from "../controllers/mentorshipController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

import {validateCreateMentorshipRequest, validateMentorshipRequestParams,} from "../middlewares/mentorshipValidation.js";

const MentorshipRouter = express.Router();

MentorshipRouter.post(
    "/requests",
    authenticate,
    authorizeRoles("STUDENT"),
    validateCreateMentorshipRequest,
    createMentorshipRequest
);

MentorshipRouter.get(
    "/requests/sent",
    authenticate,
    authorizeRoles("STUDENT"),
    getSentMentorshipRequests
);

MentorshipRouter.get(
    "/requests/received",
    authenticate,
    authorizeRoles("ALUMNI"),
    getReceivedMentorshipRequests
);

MentorshipRouter.patch(
    "/requests/:requestId/accept",
    authenticate,
    authorizeRoles("ALUMNI"),
    validateMentorshipRequestParams,
    acceptMentorshipRequest
);

MentorshipRouter.patch(
    "/requests/:requestId/decline",
    authenticate,
    authorizeRoles("ALUMNI"),
    validateMentorshipRequestParams,
    declineMentorshipRequest
);

MentorshipRouter.patch(
    "/requests/:requestId/cancel",
    authenticate,
    authorizeRoles("STUDENT"),
    validateMentorshipRequestParams,
    cancelMentorshipRequest
);

export default MentorshipRouter;