import { Channel, Collection, Guild, GuildMember, Invite, Message, TextChannel } from "discord.js";
import path from 'path';
import fs from 'fs';
import Poll from '../Poll';
import { ROOTDIR } from "../../../Constants";
import DiscordBot from "../Bot";
import { DataJSON } from "../../interfaces/MessageCarrier";
import { ServerdataJSON } from "../../types/ServerdataJSON";
import { PollJSON } from "../../types/PollJSON";

type DataFile<DataJSON> = {
    [key: string]: DataJSON
}

export default class DataHandler {

    static files = {polls:"polls.json", serverdata: "serverdata.json"}

    static init() {
        Object.entries(DataHandler.files).forEach(([key, value])=>{
            const file = path.join(ROOTDIR, `/data/${value}`)
            if (fs.existsSync(file)) return
            fs.writeFileSync(file, JSON.stringify({}))
        })
    }

    static async write(file: string, data: DataFile<DataJSON>) {
        fs.writeFileSync(path.join(ROOTDIR, `/data/${file}`), JSON.stringify(data))
    }

    static async read(file: string): Promise<DataFile<DataJSON>> {
        file = path.join(ROOTDIR, `/data/${file}`)
        if (!fs.existsSync(file)) DataHandler.init()
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    static async getPoll(id: string): Promise<PollJSON> {
        const polls = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
        return polls[id]
    }


    static async getPolls(searchSubcommand: string = "") {	

        const polls: DataFile<PollJSON> = await DataHandler.read(DataHandler.files.polls) as DataFile<PollJSON>
        const pollsMap = new Map<string, Poll>()
        if (!searchSubcommand || !Object.entries(polls).length) return pollsMap
        if (!polls) return pollsMap
        Object.entries(polls).forEach(async ([key, {question, initiatorId, subcommand, startTimestampUnix, votes, messageId, channelId}]: [string, PollJSON])=>{
                const channel: TextChannel = DiscordBot.client.channels.cache.get(channelId) as TextChannel
                if (!channel) return console.log("Channel not found", channelId)
                const message: Message = await channel.messages.fetch(messageId)
                const guild: Guild = DiscordBot.client.guilds.cache.get(channel.guild.id)
                const initiator: GuildMember = await guild.members.fetch(initiatorId)
                if (subcommand === searchSubcommand) pollsMap.set(key, new Poll(question, initiator, subcommand, startTimestampUnix, new Map(Object.entries(votes)), message))
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

    static async getServerdata(serverId: String): Promise<ServerdataJSON>{
        const serverdata: DataFile<ServerdataJSON> = await DataHandler.read(DataHandler.files.serverdata) as DataFile<ServerdataJSON>
        // @ts-ignore
        return serverdata[serverId] as ServerdataJSON
    }

    
    static async addServerdata(id: string) {
        const serverdata: DataFile<ServerdataJSON> = await DataHandler.read(DataHandler.files.serverdata) as DataFile<ServerdataJSON>
        serverdata[id] = {id: id, voteChannel: ""}
        DataHandler.write(DataHandler.files.serverdata, serverdata)
    }

}