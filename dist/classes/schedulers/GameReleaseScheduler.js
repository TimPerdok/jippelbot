"use strict";
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
            .filter((game) => !!game?.nextReleaseDate);
        return toBeReleasedGames.map((game) => {
            const releaseDate = new Date((game.nextReleaseDate ?? 0) * 1000);
            return {
                callback: () => this.releaseGame(game),
                rule: releaseDate < new Date()
                    ? new Date(new Date().getTime() + 3000)
                    : releaseDate
            };
        });
    }
    async releaseGame(game) {
        const serverdata = Bot_1.default.getInstance().dataHandlers.serverdata.getAllOfServer(this.guild.id);
        const channel = Bot_1.default.client.channels.cache.get(serverdata.releaseChannel);
        if (!channel)
            return;
        await (0, Lock_1.doWithLock)('deleteOldGameReleaseMessageLock', () => {
            return this.removeOldMessages(channel);
        });
        await channel.send({ content: `**${game.name} is gereleased!**` });
        Bot_1.default.getInstance().dataHandlers.gameSubscriptions.remove(this.guild.id, game.id);
    }
    async removeOldMessages(channel) {
        let messages = await channel.messages.fetch({ limit: 25 });
        messages = messages.filter((message) => message.author.id === Bot_1.default.client.user?.id && message.embeds.length == 0);
        for (const message of messages.values()) {
            await message.delete();
        }
    }
}
exports.default = GameReleaseManager;
