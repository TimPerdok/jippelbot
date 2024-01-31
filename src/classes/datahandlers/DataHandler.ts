import { Channel, Collection, Guild, GuildMember, Invite, Message, TextChannel } from "discord.js";
import path from 'path';
import fs from 'fs';
import Poll from '../Poll';
import DiscordBot from "../Bot";
import { DataJSON } from "../../interfaces/MessageCarrier";
import { ServerdataJSON, ServerdataJSONKey } from "../../types/ServerdataJSON";
import { PollJSON } from "../../types/PollJSON";
import { PollSubcommand } from "../../types/PollSubcommand";
import { ROOTDIR } from "../../Constants";
import { Game } from "../../api/IGDBApi";

export type DataFile<DataJSON> = {
    [guildId: string]: DataJSON
}

const dataFolder = require('path').resolve(ROOTDIR, '..')
export default class DataHandler {
    
    static files = {polls:"polls.json", serverdata: "serverdata.json", config: "config.json", gameSubscriptions: "gameSubscriptions.json"}

    static init() {
        Object.entries(DataHandler.files).forEach(([key, value])=>{
            const file = path.join(dataFolder, `/data/${value}`)
            if (fs.existsSync(file)) return;
            fs.writeFileSync(file, JSON.stringify({}))
        })
    }

    static async write(file: string, data: DataFile<DataJSON>) {
        fs.writeFileSync(path.join(dataFolder, `/data/${file}`), JSON.stringify(data))
    }

    static async read(file: string): Promise<DataFile<DataJSON>> {
        file = path.join(dataFolder, `/data/${file}`)
        if (!fs.existsSync(file)) DataHandler.init()
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    static async getPoll(id: string): Promise<PollJSON> {
        const polls = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
        return polls[id]
    }

    static async getPolls(commandObject: PollSubcommand) {	
        const polls: DataFile<PollJSON> = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
        const pollsMap = new Map<string, Poll>()
        if (!Object.entries(polls).length) return pollsMap
        if (!polls) return pollsMap
        Object.entries(polls).forEach(async ([key, {question, initiatorId, command, startTimestampUnix, votes, messageId, channelId, params}]: [string, PollJSON])=>{
                const channel: TextChannel = DiscordBot.client.channels.cache.get(channelId) as TextChannel
                if (!channel) return console.log("Channel not found", channelId)
                const message: Message = await channel.messages.fetch(messageId)
                const guild = DiscordBot.client.guilds.cache.get(channel.guild.id)
                if (!guild) return;
                const initiator: GuildMember = await guild.members.fetch(initiatorId)
                if (commandObject.name === command.split("/")[1]) pollsMap.set(key, new Poll({
                    question,
                    initiator,
                    command: commandObject,
                    startTimestampUnix,
                    votes: new Map(Object.entries(votes)),
                    message,
                    params
                }))
        })
        return pollsMap
    }

    static async setPoll(poll: PollJSON) {
        const polls: DataFile<PollJSON> = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
        polls[poll.messageId] = poll
        DataHandler.write(DataHandler.files.polls, polls)
    }

    static async removePoll(id: string) {
        const polls: DataFile<PollJSON> = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
        delete polls[id]
        DataHandler.write(DataHandler.files.polls, polls)
    }

    static async getServerdata(serverId: string): Promise<ServerdataJSON>{
        const serverdata: DataFile<ServerdataJSON> = await DataHandler.read(DataHandler.files.serverdata) as DataFile<ServerdataJSON>
        // @ts-ignore
        return serverdata[serverId] as ServerdataJSON
    }




    static async setServerdata(serverId: string, mergeObject: Partial<ServerdataJSON>) {
        const serverdata: DataFile<ServerdataJSON> = await DataHandler.read(DataHandler.files.serverdata) as DataFile<ServerdataJSON>
        serverdata[serverId] = {...serverdata[serverId], ...mergeObject};
        await DataHandler.write(DataHandler.files.serverdata, serverdata)
    }

    
    static async addServerdata(id: string) {
        const serverdata: DataFile<ServerdataJSON> = await DataHandler.read(DataHandler.files.serverdata) as DataFile<ServerdataJSON>
        serverdata[id] = {id: id, voteChannel: "", voiceChannelCategory: "", textChannelCategory: "", isDalleEnabled: false, botspamChannel: "" }
        DataHandler.write(DataHandler.files.serverdata, serverdata)
    }

    static async addGameSubscription(serverId: string, game: Game) {
        const serverdata = await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
        if (!serverdata[serverId]) serverdata[serverId] = []
        if (serverdata[serverId].find(g => g.id === game.id)) return;
        serverdata[serverId].push(game);
        DataHandler.write(DataHandler.files.gameSubscriptions, serverdata)
        DiscordBot.rescheduleGameReleaseAlerts()
    }

    static async removeGameSubscription(serverId: string, gameName: string): Promise<Game> {        
        const serverdata = await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
        if (!serverdata[serverId]) return;
        const game = serverdata[serverId].find(g => g.name.toLowerCase() === gameName.toLowerCase())
        serverdata[serverId] = serverdata[serverId].filter(g => g.name.toLowerCase() !== gameName.toLowerCase())
        DataHandler.write(DataHandler.files.gameSubscriptions, serverdata)
        DiscordBot.rescheduleGameReleaseAlerts()
        return game;
    }


    static async getGameSubscriptions(serverId: string): Promise<Game[]> {
        const serverdata = await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
        return serverdata[serverId] ?? []
    }

    static async getAllGameSubscriptions(): Promise<DataFile<Game[]>> {
        return await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
    }

    static async updateGameSubscriptions(serverdata: DataFile<Game[]>) {
        DataHandler.write(DataHandler.files.gameSubscriptions, serverdata)
        DiscordBot.rescheduleGameReleaseAlerts()
    }

    static async getGameSubscription(serverId: string, name: string): Promise<Game> {
        const serverdata = await DataHandler.read(DataHandler.files.gameSubscriptions) as DataFile<Game[]>
        return serverdata[serverId]?.find(game => game.name.toLowerCase() === name.toLowerCase()) as Game;
    }

}
