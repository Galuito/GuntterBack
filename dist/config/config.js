"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    jwtSecret: process.env.JWT_SECRET || 'tokensecreto',
    DB: {
        URI: process.env.MONGODB_URI || 'mongodb+srv://galuito:123@moviles.skrndbg.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp',
        USER: process.env.MONGODB_USER,
        PASSWORD: process.env.MONGODB_PASSWORD
    }
};
