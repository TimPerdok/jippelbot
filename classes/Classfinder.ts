import { Collection } from "discord.js";
import path from 'path';
import fs from 'fs';
import Command from "./Command";
import { ROOTDIR } from "../Constants";


export default class Classfinder {

    static async getClasses(subpath: string): Promise<any> {
        const commandsPath = path.join(ROOTDIR, subpath);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
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


}
