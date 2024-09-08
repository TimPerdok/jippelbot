"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const Bot_1 = __importDefault(require("./classes/Bot"));
const dotenv_1 = require("dotenv");
const openai_1 = require("openai");
async function init() {
    (0, dotenv_1.config)({
        path: __dirname + '/../.env'
    });
    exports.openai = new openai_1.OpenAI({
        apiKey: process.env.chatgpt
    });
    const twitchToken = {
        clientId: getToken().twitchClientId ?? "",
        clientSecret: getToken().twitchClientSecret ?? ""
    };
    const { botsecret, appid } = await getToken();
    const bot = new Bot_1.default(botsecret ?? "", appid ?? "", twitchToken);
}
init();
function getToken() {
    return {
        appid: process.env.appid,
        pubkey: process.env.pubkey,
        secret: process.env.secret,
        botsecret: process.env.botsecret,
        twitchClientId: process.env.twitchclientid,
        twitchClientSecret: process.env.twitchclientsecret
    };
}
