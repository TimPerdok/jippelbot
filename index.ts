import { Collection } from 'discord.js';
import fs from 'fs';
import { promises as fspromises } from 'fs';
import path from 'path';
import Discordbot from './classes/Bot';
import Command from './classes/Command';



async function init() {


    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    const commands = new Collection<string, Command>();
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const cls = await import(filePath);
        const command = new cls.default()
        console.log(command)
        commands.set(command.name, command);
    }

    console.log(commands)

    const {botsecret, pubkey} = await getToken()
    const bot = new Discordbot(botsecret, commands)

      
}

init()

async function getToken() {
    return JSON.parse(await fspromises.readFile('creds.json', 'utf8'))
}
