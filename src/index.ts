import Discordbot from './classes/Bot';
import { config as dotenvConfig } from 'dotenv';
import { OpenAI } from 'openai'


export let openai: OpenAI;

async function init() {
    dotenvConfig();
    openai = new OpenAI({
        apiKey: process.env.chatgpt
    });

    // const importDynamic = new Function('modulePath', 'return import(modulePath)')
    // const { ChatGPTAPI } = await importDynamic('chatgpt')
    // api = new ChatGPTAPI({
    //     apiKey: process.env.chatgpt
    // });

    // @ts-ignore

    

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