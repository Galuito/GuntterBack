"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const noteSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true,
        trim: false
    },
    noteFolder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Folder',
        required: false
    },
    color: {
        type: String,
        required: false
    },
    noteOwner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
// No middleware for now, maybe later
// Se esta rompiendo la tecla A de mi teclado :(
// Toda mi laptop se esta rompiendo :(, yo se que nada
// es eterno pero esto me pone muy triste
exports.default = (0, mongoose_1.model)('Note', noteSchema);
