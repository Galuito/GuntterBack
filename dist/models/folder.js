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
const folderSchema = new mongoose_1.Schema({
    folderName: {
        type: String,
        required: true,
        trim: true
    },
    folderOwner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});
// Don't need to do a middleware for this model
folderSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const folder = this;
        next();
    });
});
// Folder Methods
folderSchema.methods.modifyName = function (newName) {
    return __awaiter(this, void 0, void 0, function* () {
        this.folderName = newName;
        yield this.save();
        console.log(`Folder: ${this._id} was modified (folderName) and saved successfully`);
        return this._id;
    });
};
exports.default = (0, mongoose_1.model)('Folder', folderSchema);
