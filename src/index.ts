import Discordbot from './classes/Bot';
import { config as dotenvConfig } from 'dotenv';
import { OpenAI } from 'openai'
import {TwitchAuth} from './api/TwitchAccessToken'

export let openai: OpenAI;

async function init() {
    dotenvConfig(
        {
            path: __dirname + '/../.env'
        }
    );
    openai = new OpenAI({
        apiKey: process.env.chatgpt
    });

    const twitchToken: TwitchAuth = {
        clientId: getToken().twitchClientId ?? "",
        clientSecret: getToken().twitchClientSecret ?? ""
    };
    const { botsecret, appid } = await getToken();
    const bot = new Discordbot(botsecret ?? "", appid ?? "", twitchToken);
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