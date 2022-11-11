import { Collection, Invite } from "discord.js";
import path from 'path';
import fs from 'fs';
import Poll from './Poll';
import { ROOTDIR } from "../../Constants";
import DiscordBot from "./Bot";


export default class DataHandler {

    static files = {polls:"polls.json"}

    static init() {
        Object.entries(DataHandler.files).forEach(([key, value])=>{
            const file = path.join(ROOTDIR, `/data/${value}`)
            if (fs.existsSync(file)) return
            fs.writeFileSync(file, JSON.stringify({}))
        })
    }

    static async write(file: any, data: any) {
        file = path.join(ROOTDIR, `/data/${file}`)
        fs.writeFileSync(file, JSON.stringify(data))
    }

    static async read(file: any) {
        file = path.join(ROOTDIR, `/data/${file}`)
        if (!fs.existsSync(file)) DataHandler.init()
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    static async getPoll(id: string) {
        const polls = await DataHandler.read(DataHandler.files.polls)
        return polls[id]
    }


    static async getPolls(searchSubcommand: string = "") {	
        

        const polls = await DataHandler.read(DataHandler.files.polls)        
        
        const pollsMap = new Map<string, Poll>()

        if (!searchSubcommand || !Object.entries(polls).length) return pollsMap
        if (!polls) return pollsMap
        Object.entries(polls).forEach(async ([key, {question, initiator, subcommand, startTimestampUnix, votes, messageId, channelId}]: any)=>{
            const channel: any = DiscordBot.client.channels.cache.get(channelId)
            const message = await channel.messages.fetch(messageId)
            const guild = DiscordBot.client.guilds.cache.get(channel.guild.id)

            // Fetch the members of the guild and log them
            initiator = await guild.members.fetch(initiator)
            if (subcommand === searchSubcommand) pollsMap.set(key, new Poll(question, initiator, subcommand, startTimestampUnix, new Map(Object.entries(votes)), message))
        })
        return pollsMap
    }

    static async setPoll(poll: any) {
        const polls = await DataHandler.read(DataHandler.files.polls)
        polls[poll.messageId] = poll
        DataHandler.write(DataHandler.files.polls, polls)
    }

    static async removePoll(id: string) {
        const polls = await DataHandler.read(DataHandler.files.polls)
        delete polls[id]
        DataHandler.write(DataHandler.files.polls, polls)
    }

}
