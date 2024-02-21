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
const Scheduler_1 = require("../Scheduler");
const Bot_1 = __importDefault(require("../Bot"));
const IGDBApi_1 = __importDefault(require("../../api/IGDBApi"));
const util_1 = require("../../util/util");
const ScheduledActionWrapper_1 = __importDefault(require("../schedulers/ScheduledActionWrapper"));
class GameReleasesEmbedUpdater extends ScheduledActionWrapper_1.default {
    constructor(serverId) {
        super({ callback: () => this.run, at: Scheduler_1.Interval.DAILY });
        this.serverId = serverId;
        this.gameDataHandler = Bot_1.default.getInstance().dataHandlers.gameSubscriptions;
        this.serverdataHandler = Bot_1.default.getInstance().dataHandlers.serverdata;
    }
    createMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield this.serverdataHandler.getAllOfServer(this.serverId);
            const channel = Bot_1.default.client.channels.cache.get(serverdata.releaseChannel);
            const content = yield this.getContent();
            return channel.send(content);
        });
    }
    getMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = yield this.serverdataHandler.getAllOfServer(this.serverId);
            const channel = Bot_1.default.client.channels.cache.get(serverdata.releaseChannel);
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
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let subscribedGames = yield this.gameDataHandler.getAllOfServer(this.serverId);
            subscribedGames = subscribedGames.filter((game) => !(game === null || game === void 0 ? void 0 : game.nextReleaseDate)
                || game.nextReleaseDate > Math.floor(Date.now() / 1000));
            subscribedGames = yield IGDBApi_1.default.searchGames(subscribedGames.map((game) => game.id));
            yield this.gameDataHandler.overwrite(this.serverId, subscribedGames);
            const message = yield this.getMessage();
            const content = yield this.getContent();
            if (message)
                return message.edit(content);
            this.createMessage();
        });
    }
}
exports.default = GameReleasesEmbedUpdater;
