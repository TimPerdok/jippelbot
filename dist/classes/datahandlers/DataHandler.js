"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    static init() {
        Object.entries(DataHandler.files).forEach(([key, value]) => {
            const file = path_1.default.join(dataFolder, `/data/${value}`);
            if (fs_1.default.existsSync(file))
                return;
            fs_1.default.writeFileSync(file, JSON.stringify({}));
        });
    }
    static write(file, data) {
        return __awaiter(this, void 0, void 0, function* () {
            fs_1.default.writeFileSync(path_1.default.join(dataFolder, `/data/${file}`), JSON.stringify(data));
        });
    }
    static read(file) {
        return __awaiter(this, void 0, void 0, function* () {
            file = path_1.default.join(dataFolder, `/data/${file}`);
            if (!fs_1.default.existsSync(file))
                DataHandler.init();
            return JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
        });
    }
    static getPoll(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const polls = yield DataHandler.read(DataHandler.files.polls);
            return polls[id];
        });
    }
    static getPolls(commandObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const polls = yield DataHandler.read(DataHandler.files.polls);
            const pollsMap = new Map();
            if (!Object.entries(polls).length)
                return pollsMap;
            if (!polls)
                return pollsMap;
            Object.entries(polls).forEach(([key, { question, initiatorId, command, startTimestampUnix, votes, messageId, channelId, params }]) => __awaiter(this, void 0, void 0, function* () {
                const channel = Bot_1.default.client.channels.cache.get(channelId);
                if (!channel)
                    return console.log("Channel not found", channelId);
                const message = yield channel.messages.fetch(messageId);
                const guild = Bot_1.default.client.guilds.cache.get(channel.guild.id);
                if (!guild)
                    return;
                const initiator = yield guild.members.fetch(initiatorId);
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
            }));
            return pollsMap;
        });
    }
    static setPoll(poll) {
        return __awaiter(this, void 0, void 0, function* () {
            const polls = yield DataHandler.read(DataHandler.files.polls);
            polls[poll.messageId] = poll;
            DataHandler.write(DataHandler.files.polls, polls);
        });
    }
    static removePoll(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const polls = yield DataHandler.read(DataHandler.files.polls);
            delete polls[id];
            DataHandler.write(DataHandler.files.polls, polls);
        });
    }
    static getServerdata(serverId) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield DataHandler.read(DataHandler.files.serverdata);
            // @ts-ignore
            return serverdata[serverId];
        });
    }
    static setServerdata(serverId, mergeObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield DataHandler.read(DataHandler.files.serverdata);
            serverdata[serverId] = Object.assign(Object.assign({}, serverdata[serverId]), mergeObject);
            yield DataHandler.write(DataHandler.files.serverdata, serverdata);
        });
    }
    static addServerdata(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield DataHandler.read(DataHandler.files.serverdata);
            serverdata[id] = { id: id, voteChannel: "", voiceChannelCategory: "", textChannelCategory: "", isDalleEnabled: false, botspamChannel: "" };
            DataHandler.write(DataHandler.files.serverdata, serverdata);
        });
    }
    static addGameSubscription(serverId, game) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield DataHandler.read(DataHandler.files.gameSubscriptions);
            if (!serverdata[serverId])
                serverdata[serverId] = [];
            if (serverdata[serverId].find(g => g.id === game.id))
                return;
            serverdata[serverId].push(game);
            DataHandler.write(DataHandler.files.gameSubscriptions, serverdata);
            Bot_1.default.rescheduleGameReleaseAlerts();
        });
    }
    static removeGameSubscription(serverId, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield DataHandler.read(DataHandler.files.gameSubscriptions);
            if (!serverdata[serverId])
                return;
            const game = serverdata[serverId].find(g => g.name.toLowerCase() === gameName.toLowerCase());
            serverdata[serverId] = serverdata[serverId].filter(g => g.name.toLowerCase() !== gameName.toLowerCase());
            DataHandler.write(DataHandler.files.gameSubscriptions, serverdata);
            Bot_1.default.rescheduleGameReleaseAlerts();
            return game;
        });
    }
    static getGameSubscriptions(serverId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield DataHandler.read(DataHandler.files.gameSubscriptions);
            return (_a = serverdata[serverId]) !== null && _a !== void 0 ? _a : [];
        });
    }
    static getAllGameSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DataHandler.read(DataHandler.files.gameSubscriptions);
        });
    }
    static updateGameSubscriptions(serverdata) {
        return __awaiter(this, void 0, void 0, function* () {
            DataHandler.write(DataHandler.files.gameSubscriptions, serverdata);
            Bot_1.default.rescheduleGameReleaseAlerts();
        });
    }
    static getGameSubscription(serverId, name) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield DataHandler.read(DataHandler.files.gameSubscriptions);
            return (_a = serverdata[serverId]) === null || _a === void 0 ? void 0 : _a.find(game => game.name.toLowerCase() === name.toLowerCase());
        });
    }
}
exports.default = DataHandler;
DataHandler.files = { polls: "polls.json", serverdata: "serverdata.json", config: "config.json", gameSubscriptions: "gameSubscriptions.json" };
