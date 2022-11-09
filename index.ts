import { Collection } from 'discord.js';
import { promises as fspromises } from 'fs';
import Discordbot from './classes/Bot';
import Classfinder from './classes/Classfinder';
import Command from './classes/Command';



async function init() {


    const commands = await Classfinder.getClasses("commands")
    const commandCollection = new Collection<string, any>();
    commands.forEach(async ({ value }: any) => {
        if (!value) return console.error("Command error")
        const command = new value.default()
        commandCollection.set(command.name, command)
    });


    const { botsecret, appid } = await getToken()
    const bot = new Discordbot(botsecret, appid, commandCollection)


}

init()

async function getToken() {
    return JSON.parse(await fspromises.readFile('creds.json', 'utf8'))
}
