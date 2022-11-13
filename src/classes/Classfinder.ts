import { Collection } from "discord.js";
import path from 'path';
import fs from 'fs';
import Command from "./Command";
import { ROOTDIR } from "../../Constants";
import Subcommand from "./Subcommand";


export default class Classfinder {

    static commandsPath = path.join(ROOTDIR, 'commands')

    static async getCommands(): Promise<Command[]> {
        const classes: Command[] = fs.readdirSync(Classfinder.commandsPath).filter(file => file.endsWith('.ts')).map((file) => {
            const filePath = path.join(Classfinder.commandsPath, file);
            const obj = require(filePath);
            return new obj.default()
        })
        return classes
    }

    static async getSubcommands(subpath: string): Promise<Subcommand[]> {
        try {
            const classesPath = path.join(ROOTDIR, "commands/" + subpath);
            const classes: Subcommand[] = fs.readdirSync(classesPath).filter(file => file.endsWith('.ts')).map((file) => {
                const filePath = path.join(classesPath, file);
                const obj = require(filePath);
                return new obj.default()
            })
            return classes
        } catch(error) {
            return []
        }
    }

    static async getSubcommand(parentCommand: string, subcommandName: string): Promise<Subcommand> {
        const classesPath = path.join(ROOTDIR, "commands/" + parentCommand);
        const classes: Subcommand[] = fs.readdirSync(classesPath).filter(file => file.endsWith('.ts') && file.toLowerCase().startsWith(subcommandName.toLowerCase())).map((file) => {
            console.log(file, subcommandName, parentCommand)
            const filePath = path.join(classesPath, file);
            const obj = require(filePath);
            return new obj.default()
        })
        return classes[0]
    }


}
