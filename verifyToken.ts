import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const token = process.env.JWT_TOKEN;

try {
    if (!JWT_ACCESS_SECRET || !token) {
        throw new Error('Missing JWT_ACCESS_SECRET or JWT_TOKEN environment variable');
    }
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
    console.log("token is right ", decoded);
} catch (err: unknown) {
    if (err instanceof Error) {
        console.log("invalid token", err.message);
    }
}
