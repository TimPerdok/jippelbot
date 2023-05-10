"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const Bot_1 = __importDefault(require("./classes/Bot"));
const chatgpt_1 = require("chatgpt");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.api = new chatgpt_1.ChatGPTAPI({
    apiKey: process.env.chatgpt
});
async function init() {
    const { botsecret, appid } = await getToken();
    const bot = new Bot_1.default(botsecret, appid);
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
