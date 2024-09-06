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
const Bot_1 = __importDefault(require("../Bot"));
const Lock_1 = require("../Lock");
const Scheduler_1 = __importDefault(require("../Scheduler"));
class GameReleaseManager {
    constructor(guild) {
        this.guild = guild;
        this.scheduler = new Scheduler_1.default(this.createScheduledActions(), "GameReleaseScheduler");
    }
    createScheduledActions() {
        const toBeReleasedGames = Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(this.guild.id)
            .filter((game) => !!(game === null || game === void 0 ? void 0 : game.nextReleaseDate));
        return toBeReleasedGames.map((game) => {
            var _a;
            const releaseDate = new Date(((_a = game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000);
            return {
                callback: () => this.releaseGame(game),
                rule: releaseDate < new Date()
                    ? new Date(new Date().getTime() + 3000)
                    : releaseDate
            };
        });
    }
    releaseGame(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = Bot_1.default.getInstance().dataHandlers.serverdata.getAllOfServer(this.guild.id);
            const channel = Bot_1.default.client.channels.cache.get(serverdata.releaseChannel);
            if (!channel)
                return;
            yield (0, Lock_1.doWithLock)('deleteOldGameReleaseMessageLock', () => {
                return this.removeOldMessages(channel);
            });
            yield channel.send({ content: `**${game.name} is gereleased!**` });
            Bot_1.default.getInstance().dataHandlers.gameSubscriptions.remove(this.guild.id, game.id);
        });
    }
    removeOldMessages(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            let messages = yield channel.messages.fetch({ limit: 25 });
            messages = messages.filter((message) => { var _a; return message.author.id === ((_a = Bot_1.default.client.user) === null || _a === void 0 ? void 0 : _a.id) && message.embeds.length == 0; });
            for (const message of messages.values()) {
                yield message.delete();
            }
        });
    }
}
exports.default = GameReleaseManager;
