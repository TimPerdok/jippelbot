"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const child_process_1 = require("child_process");
class StdinListener {
    constructor() { }
    start() {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.on('line', (line) => {
            (0, child_process_1.exec)(line, (error, stdout, stderr) => {
                if (error)
                    return console.error(error);
                if (stderr)
                    return console.error(stderr);
                console.log(`stdout: ${stdout}`);
            });
        });
    }
}
exports.default = StdinListener;
