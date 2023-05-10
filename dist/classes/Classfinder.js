"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Constants_1 = require("../Constants");
class Classfinder {
    static commandsPath = path_1.default.join(Constants_1.ROOTDIR, 'commands');
    static async getCommands() {
        const classes = fs_1.default.readdirSync(Classfinder.commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js')).map((file) => {
            const filePath = path_1.default.join(Classfinder.commandsPath, file);
            const obj = require(filePath);
            return new obj.default();
        });
        return classes;
    }
    static async getSubcommands(subpath) {
        try {
            const classesPath = path_1.default.join(Constants_1.ROOTDIR, "commands", subpath);
            const classes = fs_1.default.readdirSync(classesPath).filter(file => file.endsWith('.ts') || file.endsWith('.js')).map((file) => {
                const filePath = path_1.default.join(classesPath, file);
                const obj = require(filePath);
                return new obj.default();
            });
            return classes;
        }
        catch (error) {
            return [];
        }
    }
    static async getSubcommand(commandPath) {
        const classPath = path_1.default.join(Constants_1.ROOTDIR, "commands", commandPath);
        const obj = require(classPath);
        return new obj.default();
    }
}
exports.default = Classfinder;
