import { Collection } from "discord.js";
import path from 'path';
import fs from 'fs';
import Command from "./Command";
import { ROOTDIR } from "../Constants";


export default class Classfinder {

    static async getClasses(subpath: string): Promise<any> {
        const commandsPath = path.join(ROOTDIR, subpath);
        if (!fs.existsSync(commandsPath)) return console.error("Commands path does not exist");
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'))
        const promises = commandFiles.map((file)=>{
            const filePath = path.join(commandsPath, file);
            try {
                return import(filePath);
            } catch (error) {
                console.error(error)
                return null
            }
        })
        return await Promise.allSettled(promises)
    }

    static getClassesSync(subpath: string): any {
        const commandsPath = path.join(ROOTDIR, subpath);
        if (!fs.existsSync(commandsPath)) return console.error("Commands path does not exist");
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'))
        const commands = commandFiles.map((file)=>{
            const filePath = path.join(commandsPath, file);
            try {
                return require(filePath);
            } catch (error) {
                console.error(error)
                return null
            }
        })
        return commands

        
    }



}
