import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_ACCESS_SECRET="your_access_secret_here5456"

const token: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWkyYWFxMm0wMDAwN2trb3oxcWw0aW82IiwiZW1haWwiOiJ0ZXNydEBnbWFpbC5jb20iLCJpYXQiOjE3NjU4Mjk1NTgsImV4cCI6MTc2NTgzMDQ1OH0.g70C2ONMku9MS7JS65_axOlXjWXgvkI5-uL6EB-UR3c";

try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
    console.log("token is right ", decoded);
} catch (err: unknown) {
    if (err instanceof Error) {
        console.log("invalid token", err.message);
    }
}
