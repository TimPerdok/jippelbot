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
const ScheduledActionWrapper_1 = __importDefault(require("./messageupdaters/ScheduledActionWrapper"));
class GameReleaseScheduler {
    constructor(guild) {
        this.guild = guild;
        this.scheduledActions = this.createScheduledActions();
    }
    createScheduledActions() {
        const toBeReleasedGames = Bot_1.default.getInstance().dataHandlers.gameSubscriptions.getAllOfServer(this.guild.id)
            .filter((game) => !!(game === null || game === void 0 ? void 0 : game.nextReleaseDate));
        return toBeReleasedGames.map((game) => {
            var _a;
            return new ScheduledActionWrapper_1.default({
                callback: () => this.sendGameReleaseAlert(game),
                at: new Date(((_a = game.nextReleaseDate) !== null && _a !== void 0 ? _a : 0) * 1000)
            });
        });
    }
    unschedule() {
        this.scheduledActions.forEach((action) => action.stop());
    }
    reschedule() {
        this.unschedule();
        this.scheduledActions = this.createScheduledActions();
    }
    sendGameReleaseAlert(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverdata = Bot_1.default.getInstance().dataHandlers.serverdata.getAllOfServer(this.guild.id);
            const channel = Bot_1.default.client.channels.cache.get(serverdata.releaseChannel);
            if (!channel)
                return;
            const messages = yield channel.messages.fetch({ limit: 25 });
            const message = messages.find((message) => { var _a; return message.author.id === ((_a = Bot_1.default.client.user) === null || _a === void 0 ? void 0 : _a.id) && message.embeds.length == 0; });
            message === null || message === void 0 ? void 0 : message.delete();
            channel.send({ content: `**${game.name} is gereleased!**` });
        });
    }
}
exports.default = GameReleaseScheduler;