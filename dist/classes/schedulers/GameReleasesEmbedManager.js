"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IGDBApi_1 = __importDefault(require("../../api/IGDBApi"));
const util_1 = require("../../util/util");
const Bot_1 = __importDefault(require("../Bot"));
const Scheduler_1 = __importStar(require("../Scheduler"));
class GameReleaseEmbedManager {
    constructor(serverId) {
        this.serverId = serverId;
        const dataHandlers = Bot_1.default.getInstance().dataHandlers;
        this.gameDataHandler = dataHandlers.gameSubscriptions;
        this.serverdataHandler = dataHandlers.serverdata;
        this.scheduler = new Scheduler_1.default([{ callback: this.refresh, rule: Scheduler_1.Interval.DAILY }], "GameReleaseEmbedManager");
        this.refresh();
    }
    async getMessage() {
        const channel = await this.getReleaseChannel();
        const messages = await channel.messages.fetch({ limit: 25 });
        return messages.find((message) => message.author.id === Bot_1.default.client.user?.id && message.embeds.length > 0);
    }
    async getContent() {
        const games = await this.gameDataHandler.getAllOfServer(this.serverId);
        const embed = await (0, util_1.createEmbed)(games);
        return { embeds: [embed] };
    }
    async getReleaseChannel() {
        const serverdata = await this.serverdataHandler.getAllOfServer(this.serverId);
        const channel = Bot_1.default.client.channels.cache.get(serverdata.releaseChannel);
        return channel;
    }
    async refresh() {
        // Update all games
        await this.updateGames();
        // Update the embed message
        this.updateMessage();
    }
    async updateGames() {
        const games = this.gameDataHandler.getAllOfServer(this.serverId);
        const updatedGames = await IGDBApi_1.default.searchGames(games.map((game) => game.id));
        this.gameDataHandler.overwrite(this.serverId, games.map((game) => ({
            ...game,
            ...updatedGames.find((newGame) => newGame.id === game.id)
        })));
    }
    async updateMessage() {
        const content = await this.getContent();
        const message = await this.getMessage();
        if (message)
            return message.edit(content);
        const channel = await this.getReleaseChannel();
        return channel.send(content);
    }
}
exports.default = GameReleaseEmbedManager;
