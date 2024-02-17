"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Constants_1 = require("../../Constants");
const dataFolder = require('path').resolve(Constants_1.SRC_DIR, '..');
class TokenHandler {
    static init() {
        const folder = path_1.default.join(dataFolder, `/shareddata`);
        if (!fs_1.default.existsSync(folder))
            fs_1.default.mkdirSync(folder);
        Object.entries(TokenHandler.files).forEach(([key, value]) => {
            const file = path_1.default.join(dataFolder, `/shareddata/${value}`);
            if (fs_1.default.existsSync(file))
                return;
            fs_1.default.writeFileSync(file, JSON.stringify({}));
        });
    }
    static write(file, data) {
        if (!fs_1.default.existsSync(file))
            TokenHandler.init();
        fs_1.default.writeFileSync(path_1.default.join(dataFolder, `/shareddata/${file}`), JSON.stringify(data));
    }
    static read(file) {
        file = path_1.default.join(dataFolder, `/shareddata/${file}`);
        if (!fs_1.default.existsSync(file))
            TokenHandler.init();
        return JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
    }
    static getTwitchAccessToken() {
        const file = path_1.default.join(dataFolder, `/shareddata/${TokenHandler.files.twitchaccesstoken}`);
        if (!fs_1.default.existsSync(file))
            return { accessToken: "", expireTimestamp: 0 };
        return JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
    }
    static setTwitchAccessToken(token) {
        TokenHandler.write(TokenHandler.files.twitchaccesstoken, token);
    }
}
exports.default = TokenHandler;
TokenHandler.files = { twitchaccesstoken: "twitchaccesstoken.json" };
