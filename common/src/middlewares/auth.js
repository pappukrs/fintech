"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.currentUser = void 0;
const errors_1 = require("../errors");
const currentUser = (req, res, next) => {
    // Simple placeholder for JWT verification
    // In a real app, this would verify the token and set req.user
    next();
};
exports.currentUser = currentUser;
const requireAuth = (req, res, next) => {
    if (!req.currentUser) {
        throw new errors_1.NotAuthorizedError();
    }
    next();
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.js.map