import jwt from 'jsonwebtoken';
const key = "----jsonExprireinwe3450";

export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Unauthorization =>", req.headers);
        return res.status(401).json({
            resultCode: 401,
            message: "Unauthorization"
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, key, { algorithms: ["HS256"] }, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                console.log("Token expired");
                return res.status(401).json({
                    resultCode: 401,
                    message: "Token is expired"
                });
            } else {
                console.log("JWT decode error:", err);
                return res.status(403).json({
                    resultCode: 403,
                    message: "Forbidden"
                });
            }
        }

        // save info to req
        req.user_id = decoded.user_id;
        req.user_name = decoded.user_name;
        req.user_premission = decoded.user_premission;

        next(); // เรียก next() หลัง verify สำเร็จ
    });
};
