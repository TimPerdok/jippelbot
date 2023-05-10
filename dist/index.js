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
exports.api = void 0;
const Bot_1 = __importDefault(require("./classes/Bot"));
const dotenv_1 = require("dotenv");
exports.api = null;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, dotenv_1.config)();
        const importDynamic = new Function('modulePath', 'return import(modulePath)');
        const { ChatGPTAPI } = yield importDynamic('chatgpt');
        exports.api = new ChatGPTAPI({
            apiKey: process.env.chatgpt
        });
        const { botsecret, appid } = yield getToken();
        const bot = new Bot_1.default(botsecret, appid);
    });
}
init();
function getToken() {
    return {
        appid: process.env.appid,
        pubkey: process.env.pubkey,
        secret: process.env.secret,
        botsecret: process.env.botsecret
    };
}
