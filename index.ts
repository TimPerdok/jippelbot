import { Collection } from 'discord.js';
import { promises as fspromises } from 'fs';
import Discordbot from './src/classes/Bot';
import Classfinder from './src/classes/Classfinder';
import Command from './src/classes/Command';



async function init() {


    const { botsecret, appid } = await getToken()
    const bot = new Discordbot(botsecret, appid)


}

init()

async function getToken() {
    return JSON.parse(await fspromises.readFile('creds.json', 'utf8'))
}
