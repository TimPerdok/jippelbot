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


    async write(file: string, data: ServerScoped<T>) {
        fs.writeFileSync(path.join(this.dataFolder, file), JSON.stringify(data))
    }

    read(file: string): ServerScoped<T> {
        file = path.join(this.dataFolder, file)
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    async overwrite(serverId: string, data: T) {
        const file = await this.read(this.file) as ServerScoped<T>
        file[serverId] = data
        await this.write(this.file, file)
    }


    getAllOfServer(serverId: string): T {
        const file = this.read(this.file) as ServerScoped<T>
        return file[serverId] ?? {} as T
    }

    async getAll(): Promise<ServerScoped<T>> {
        return await this.read(this.file) as ServerScoped<T>
    }

    async overwriteAll(data: ServerScoped<T>) {
        await this.write(this.file, data)
    }


    // static async getPoll(id: string): Promise<PollJSON> {
    //     const polls = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
    //     return polls[id]
    // }

    // static async getPolls(commandObject: PollSubcommand) {
    //     const polls: DataFile<PollJSON> = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
    //     const pollsMap = new Map<string, Poll>()
    //     if (!Object.entries(polls).length) return pollsMap
    //     if (!polls) return pollsMap
    //     Object.entries(polls).forEach(async ([key, { question, initiatorId, command, startTimestampUnix, votes, messageId, channelId, params }]: [string, PollJSON]) => {
    //         const channel: TextChannel = DiscordBot.client.channels.cache.get(channelId) as TextChannel
    //         if (!channel) return console.log("Channel not found", channelId)
    //         const message: Message = await channel.messages.fetch(messageId)
    //         const guild = DiscordBot.client.guilds.cache.get(channel.guild.id)
    //         if (!guild) return;
    //         const initiator: GuildMember = await guild.members.fetch(initiatorId)
    //         if (commandObject.name === command.split("/")[1]) pollsMap.set(key, new Poll({
    //             question,
    //             initiator,
    //             command: commandObject,
    //             startTimestampUnix,
    //             votes: new Map(Object.entries(votes)),
    //             message,
    //             params
    //         }))
    //     })
    //     return pollsMap
    // }

    // static async setPoll(poll: PollJSON) {
    //     const polls: DataFile<PollJSON> = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
    //     polls[poll.messageId] = poll
    //     DataHandler.write(DataHandler.files.polls, polls)
    // }

    // static async removePoll(id: string) {
    //     const polls: DataFile<PollJSON> = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
    //     delete polls[id]
    //     DataHandler.write(DataHandler.files.polls, polls)
    // }

    // static isDalleEnabled = true

    // static async getServerdata(serverId: string): Promise<ServerT> {
    //     return (await this.getServerdatas())?.[serverId] ?? {} as ServerT
    // }

    // static async getServerdatas(): Promise<Serverdatas> {
    //     return {
    //         // jippel:
    //         "230013544827977728": {
    //             "voteChannel": "1040955433654943774",
    //             "voiceChannelCategory": "360841239374987265",
    //             "textChannelCategory": "360841063373471744",
    //             "isDalleEnabled": this.isDalleEnabled,
    //             "releaseChannel": "1202969536119185479"
    //         },
    //         // onmo test server:
    //         "617369917158850590": {
    //             "voteChannel": "1040971723299881010",
    //             "voiceChannelCategory": "617369917158850593",
    //             "textChannelCategory": "617369917158850591",
    //             "isDalleEnabled": this.isDalleEnabled,
    //             "releaseChannel": "1041814103477473360"
    //         }
    //     }
    // }


    // static async setDalleEnabled(enabled: boolean) {
    //     this.isDalleEnabled = enabled
    // }


    // static async addGameSubscription(serverId: string, game: Game) {
    //     const data = await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>;
    //     const serverData = data?.[serverId] || [];
    //     const existingGameIndex = serverData.findIndex(g => g.id === game.id);

    //     if (existingGameIndex !== -1) serverData[existingGameIndex] = { ...serverData[existingGameIndex], ...game }
    //     else serverData.push(game);
    //     data[serverId] = serverData;
    //     await DataHandler.write(DataHandler.files.gameSubscriptions, data);
    // }

    // static async removeGameSubscription(serverId: string, gameName: string): Promise<Game | undefined> {
    //     const serverdata = await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
    //     if (!serverdata[serverId]) return;
    //     const game = serverdata[serverId].find(g => g.name.toLowerCase() === gameName.toLowerCase())
    //     serverdata[serverId] = serverdata[serverId].filter(g => g.name.toLowerCase() !== gameName.toLowerCase())
    //     DataHandler.write(DataHandler.files.gameSubscriptions, serverdata)
    //     return game;
    // }


    // static async getGameSubscriptions(serverId: string): Promise<Game[]> {
    //     const serverdata = await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
    //     return serverdata[serverId] ?? []
    // }

    // static async getAllGameSubscriptions(): Promise<DataFile<Game[]>> {
    //     return await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
    // }

    // static async updateGameSubscriptions(serverdata: DataFile<Game[]>) {
    //     DataHandler.write(DataHandler.files.gameSubscriptions, serverdata)
    // }

    // static async getGameSubscription(serverId: string, name: string): Promise<Game> {
    //     const serverdata = await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
    //     return serverdata[serverId]?.find(game => game.name.toLowerCase() === name.toLowerCase()) as Game;
    // }

}
