"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// Methods
noteSchema.methods.modifyTitle = function (newTitle) {
    return __awaiter(this, void 0, void 0, function* () {
        this.title = newTitle;
        yield this.save();
        console.log(`User: ${this.noteOwner} has modified note: ${this.title} (title) and saved it successfully`);
        return this.title;
    });
};
noteSchema.methods.modifyContent = function (newContent) {
    return __awaiter(this, void 0, void 0, function* () {
        this.desc = newContent;
        yield this.save();
        console.log(`User: ${this.noteOwner} has modified note: ${this.title} (content) and saved it successfully`);
        return this.title;
    });
};
noteSchema.methods.removeFolder = function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.noteFolder = null;
        yield this.save();
        console.log(`User: ${this.noteOwner} has removed the folder from note: ${this.title} and saved it successfully`);
        return this.title;
    });
};
noteSchema.methods.changeFolder = function (newFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        this.noteFolder = newFolder;
        yield this.save();
        console.log(`User: ${this.noteOwner} has changed the folder from note: ${this.title} and saved it successfully`);
        return this.title;
    });
};
noteSchema.methods.modifyColor = function (newColor) {
    return __awaiter(this, void 0, void 0, function* () {
        this.color = newColor;
        yield this.save();
        console.log(`User: ${this.noteOwner} has modified note: ${this.title} (color) and saved it successfully`);
        return this.title;
    });
};
exports.default = (0, mongoose_1.model)('Note', noteSchema);
