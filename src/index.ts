import Discordbot from './classes/Bot';
import { config as dotenvConfig } from 'dotenv';

export let api = null;

async function init() {
    dotenvConfig();
    const importDynamic = new Function('modulePath', 'return import(modulePath)')
    const { ChatGPTAPI } = await importDynamic('chatgpt')
    api = new ChatGPTAPI({
        apiKey: process.env.chatgpt
    });

    const { botsecret, appid } = await getToken();
    const bot = new Discordbot(botsecret, appid);
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