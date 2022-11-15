"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Renamechannel_1 = __importDefault(require("../src/commands/vote/Renamechannel"));
(0, globals_1.describe)('commands', () => {
    (0, globals_1.test)('Vote', () => {
        const vote = new Renamechannel_1.default();
        (0, globals_1.expect)(vote).toBeInstanceOf(Renamechannel_1.default);
    });
});
