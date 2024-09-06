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
    getMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.getReleaseChannel();
            const messages = yield channel.messages.fetch({ limit: 25 });
            return messages.find((message) => { var _a; return message.author.id === ((_a = Bot_1.default.client.user) === null || _a === void 0 ? void 0 : _a.id) && message.embeds.length > 0; });
        });
    }
    getContent() {
        return __awaiter(this, void 0, void 0, function* () {
            const games = yield this.gameDataHandler.getAllOfServer(this.serverId);
            const embed = yield (0, util_1.createEmbed)(games);
            return { embeds: [embed] };
        });
    }
    getReleaseChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield this.serverdataHandler.getAllOfServer(this.serverId);
            const channel = Bot_1.default.client.channels.cache.get(serverdata.releaseChannel);
            return channel;
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            // Update all games
            this.updateGames();
            // Update the embed message
            this.updateMessage();
        });
    }
    updateGames() {
        return __awaiter(this, void 0, void 0, function* () {
            const games = this.gameDataHandler.getAllOfServer(this.serverId);
            const updatedGames = yield IGDBApi_1.default.searchGames(games.map((game) => game.id));
            this.gameDataHandler.overwrite(this.serverId, games.map((game) => (Object.assign(Object.assign({}, game), updatedGames.find((newGame) => newGame.id === game.id)))));
        });
    }
    updateMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.getContent();
            const message = yield this.getMessage();
            if (message)
                return message.edit(content);
            const channel = yield this.getReleaseChannel();
            return channel.send(content);
        });
    }
}
exports.default = GameReleaseEmbedManager;
