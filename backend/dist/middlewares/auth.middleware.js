import { verifyToken } from "../services/auth/token.service.js";
export const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
        return;
    }
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
        return;
    }
    try {
        req.user = verifyToken(token);
        next();
    }
    catch (_error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map