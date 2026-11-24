import jwt from 'jsonwebtoken'
const key = `----jsonExprireinwe3450`;

const getExpiresIn = (value) => {
    const configuredValue = value?.trim();
    if (!configuredValue) {
        return '24h';
    }

    if (/^\d+$/.test(configuredValue)) {
        const seconds = Number(configuredValue);
        if (Number.isSafeInteger(seconds) && seconds > 0) {
            return seconds;
        }
    }

    const duration = configuredValue.replace(/\s+/g, '').toLowerCase();
    if (/^\d+(ms|s|m|h|d|w|y)$/.test(duration)) {
        return duration;
    }

    throw new Error('JWT_AGE must be positive seconds or a duration such as 24h');
};

export const genAccessTlken = (payload) => {
    const accessOptions ={
        expiresIn: getExpiresIn(process.env.JWT_AGE),
            algorithm: "HS256",
    }
    return jwt.sign(payload,key,accessOptions)
}