import { Channel, Collection, Guild, GuildMember, Invite, Message, TextChannel } from "discord.js";
import path from 'path';
import fs from 'fs';
import { SRC_DIR } from "../../Constants";
import { Game } from "../../api/IGDB";
import { TwitchAccessTokenJSON } from "../../api/TwitchAccessToken";
import { PollJSON } from "../../types/PollJSON";
import { ServerConfig } from "../../types/ServerdataJSON";
import { VoteAction } from "../data/VoteActions";

export type ServerScoped<JSONData> = {
    [guildId: string]: JSONData
}

export type DataJSON =  UnidentifiableItem | IdentifiableItem[]

export type UnidentifiableItem = ServerConfig | TwitchAccessTokenJSON

export type IdentifiableItem = PollJSON<VoteAction> | Game

export type Item = UnidentifiableItem | IdentifiableItem

export default class JSONDataHandler<T extends DataJSON>{
   
    protected dataFolder = path.join(SRC_DIR, "..", 'data')

    constructor(protected file: string) {
        this.init()
    }

    init() {
        if (!fs.existsSync(this.dataFolder)) fs.mkdirSync(this.dataFolder)
        const fullPath = path.join(this.dataFolder, this.file)
        if (fs.existsSync(fullPath)) return;
        fs.writeFileSync(fullPath, JSON.stringify({}))
    }

    write(file: string, data: ServerScoped<T>) {
        fs.writeFileSync(path.join(this.dataFolder, file), JSON.stringify(data))
    }

    read(file: string): ServerScoped<T> {
        file = path.join(this.dataFolder, file)
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    overwrite(serverId: string, data: T) {
        const file = this.read(this.file) as ServerScoped<T>
        file[serverId] = data
        this.write(this.file, file)
    }


    getAllOfServer(serverId: string): T {
        const file = this.read(this.file) as ServerScoped<T>
        return file[serverId] ?? {} as T
    }

    getAll(): ServerScoped<T> {
        return this.read(this.file) as ServerScoped<T>
    }

    overwriteAll(data: ServerScoped<T>) {
        this.write(this.file, data)
    }

}
