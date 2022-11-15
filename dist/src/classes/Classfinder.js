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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Constants_1 = require("../Constants");
class Classfinder {
    static getCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            const classes = fs_1.default.readdirSync(Classfinder.commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js')).map((file) => {
                const filePath = path_1.default.join(Classfinder.commandsPath, file);
                const obj = require(filePath);
                return new obj.default();
            });
            return classes;
        });
    }
    static getSubcommands(subpath) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    static getSubcommand(commandPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const classPath = path_1.default.join(Constants_1.ROOTDIR, "commands", commandPath);
            const obj = require(classPath);
            return new obj.default();
        });
    }
}
exports.default = Classfinder;
Classfinder.commandsPath = path_1.default.join(Constants_1.ROOTDIR, 'commands');
