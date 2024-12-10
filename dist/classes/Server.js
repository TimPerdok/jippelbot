"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameReleaseScheduler_1 = __importDefault(require("./schedulers/GameReleaseScheduler"));
const GameReleasesEmbedManager_1 = __importDefault(require("./schedulers/GameReleasesEmbedManager"));
class Server {
    constructor(guild) {
        this.guild = guild;
        this.gameReleasesEmbedUpdater = new GameReleasesEmbedManager_1.default(this.guild.id);
        this.gameReleaseScheduler = new GameReleaseScheduler_1.default(this.guild);
    }
    refreshLiveMessages() {
        this.gameReleasesEmbedUpdater.refresh();
    }
}
exports.default = Server;
