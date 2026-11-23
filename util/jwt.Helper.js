import jwt from 'jsonwebtoken'
const key = `----jsonExprireinwe3450`;
export const genAccessTlken = (payload) => {
    const accessOptions ={
        expiresIn: process.env.JWT_AGE,
            algorithm: "HS256",
    }
    return jwt.sign(payload,key,accessOptions)
}