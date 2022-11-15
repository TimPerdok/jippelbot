import { Collection } from 'discord.js';
import { promises as fspromises } from 'fs';
import Discordbot from './classes/Bot';
import Classfinder from './classes/Classfinder';
import Command from './classes/Command';



async function init() {


    const { botsecret, appid } = await getToken()
    const bot = new Discordbot(botsecret, appid)


}

init()

async function getToken() {
    return JSON.parse(await fspromises.readFile('creds.json', 'utf8'))
}
