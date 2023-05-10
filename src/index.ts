import Discordbot from './classes/Bot';

require('dotenv').config()

async function init() {

    const { botsecret, appid } = await getToken()
    const bot = new Discordbot(botsecret, appid)

}

init()

function getToken() {
    return {
        appid: process.env.appid,
        pubkey: process.env.pubkey,
        secret: process.env.secret,
        botsecret: process.env.botsecret
    }
}
