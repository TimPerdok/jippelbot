"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Poll_1 = __importDefault(require("../Poll"));
const Bot_1 = __importDefault(require("../Bot"));
const Constants_1 = require("../../Constants");
const dataFolder = require('path').resolve(Constants_1.ROOTDIR, '..');
class DataHandler {
    static files = { polls: "polls.json", serverdata: "serverdata.json" };
    static init() {
        Object.entries(DataHandler.files).forEach(([key, value]) => {
            const file = path_1.default.join(dataFolder, `/data/${value}`);
            if (fs_1.default.existsSync(file))
                return;
            fs_1.default.writeFileSync(file, JSON.stringify({}));
        });
    }
    static async write(file, data) {
        fs_1.default.writeFileSync(path_1.default.join(dataFolder, `/data/${file}`), JSON.stringify(data));
    }
    static async read(file) {
        file = path_1.default.join(dataFolder, `/data/${file}`);
        if (!fs_1.default.existsSync(file))
            DataHandler.init();
        return JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
    }
    static async getPoll(id) {
        const polls = await DataHandler.read(DataHandler.files.polls);
        return polls[id];
    }
    static async getPolls(commandObject) {
        const polls = await DataHandler.read(DataHandler.files.polls);
        const pollsMap = new Map();
        if (!Object.entries(polls).length)
            return pollsMap;
        if (!polls)
            return pollsMap;
        Object.entries(polls).forEach(async ([key, { question, initiatorId, command, startTimestampUnix, votes, messageId, channelId, params }]) => {
            const channel = Bot_1.default.client.channels.cache.get(channelId);
            if (!channel)
                return console.log("Channel not found", channelId);
            const message = await channel.messages.fetch(messageId);
            const guild = Bot_1.default.client.guilds.cache.get(channel.guild.id);
            const initiator = await guild.members.fetch(initiatorId);
            if (commandObject.name === command.split("/")[1])
                pollsMap.set(key, new Poll_1.default({
                    question,
                    initiator,
                    command: commandObject,
                    startTimestampUnix,
                    votes: new Map(Object.entries(votes)),
                    message,
                    params
                }));
        });
        return pollsMap;
    }
    static async setPoll(poll) {
        const polls = await DataHandler.read(DataHandler.files.polls);
        polls[poll.messageId] = poll;
        DataHandler.write(DataHandler.files.polls, polls);
    }
    static async removePoll(id) {
        const polls = await DataHandler.read(DataHandler.files.polls);
        delete polls[id];
        DataHandler.write(DataHandler.files.polls, polls);
    }
    static async getServerdata(serverId) {
        const serverdata = await DataHandler.read(DataHandler.files.serverdata);
        // @ts-ignore
        return serverdata[serverId];
    }
    static async addServerdata(id) {
        const serverdata = await DataHandler.read(DataHandler.files.serverdata);
        serverdata[id] = { id: id, voteChannel: "", voiceChannelCategory: "", textChannelCategory: "" };
        DataHandler.write(DataHandler.files.serverdata, serverdata);
    }
}
exports.default = DataHandler;
