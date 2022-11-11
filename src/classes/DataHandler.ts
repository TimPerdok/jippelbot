import { Channel, Collection, Guild, Invite, Message, TextChannel } from "discord.js";
import path from 'path';
import fs from 'fs';
import Poll, { PollJSON } from './Poll';
import { ROOTDIR } from "../../Constants";
import DiscordBot from "./Bot";
import { DataJSON } from "../interfaces/MessageCarrier";


export default class DataHandler {

    static files = {polls:"polls.json"}

    static init() {
        Object.entries(DataHandler.files).forEach(([key, value])=>{
            const file = path.join(ROOTDIR, `/data/${value}`)
            if (fs.existsSync(file)) return
            fs.writeFileSync(file, JSON.stringify({}))
        })
    }

    static async write(file: string, data: DataJSON) {
        fs.writeFileSync(path.join(ROOTDIR, `/data/${file}`), JSON.stringify(data))
    }

    static async read(file: string): Promise<DataJSON[]> {
        file = path.join(ROOTDIR, `/data/${file}`)
        if (!fs.existsSync(file)) DataHandler.init()
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    static async getPoll(id: string) {
        const polls = await DataHandler.read(DataHandler.files.polls)
        return polls[id]
    }


    static async getPolls(searchSubcommand: string = "") {	
        const polls: PollJSON[] = await DataHandler.read(DataHandler.files.polls) as PollJSON[]       
        const pollsMap = new Map<string, Poll>()
        if (!searchSubcommand || !Object.entries(polls).length) return pollsMap
        if (!polls) return pollsMap
        Object.entries(polls).forEach(async ([key, {question, initiator, subcommand, startTimestampUnix, votes, messageId, channelId}]: any)=>{
            const channel: TextChannel = DiscordBot.client.channels.cache.get(channelId) as TextChannel
            const message: Message = await channel.messages.fetch(messageId)
            const guild: Guild = DiscordBot.client.guilds.cache.get(channel.guild.id)
            initiator = await guild.members.fetch(initiator)
            if (subcommand === searchSubcommand) pollsMap.set(key, new Poll(question, initiator, subcommand, startTimestampUnix, new Map(Object.entries(votes)), message))
        })
        return pollsMap
    }

    static async setPoll(poll: PollJSON) {
        const polls: PollJSON[] = await DataHandler.read(DataHandler.files.polls) as PollJSON[]  
        polls[poll.messageId] = poll
        DataHandler.write(DataHandler.files.polls, polls)
    }

    static async removePoll(id: string) {
        const polls: PollJSON[] = await DataHandler.read(DataHandler.files.polls) as PollJSON[]  
        delete polls[id]
        DataHandler.write(DataHandler.files.polls, polls)
    }

}
