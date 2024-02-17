"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameReleasesEmbedUpdater_1 = __importDefault(require("./gamereleases/GameReleasesEmbedUpdater"));
const GameReleaseScheduler_1 = __importDefault(require("./schedulers/GameReleaseScheduler"));
const VoteScheduler_1 = __importDefault(require("./schedulers/VoteScheduler"));
class Server {
    constructor(guild, config, rest) {
        this.guild = guild;
        this.config = config;
        this.rest = rest;
        this.gameReleasesEmbedUpdater = new GameReleasesEmbedUpdater_1.default(this.guild.id);
        this.gameReleaseScheduler = new GameReleaseScheduler_1.default(this.guild);
        this.voteScheduler = new VoteScheduler_1.default(this.guild);
    }
    rescheduleGameReleases() {
        this.gameReleaseScheduler.reschedule();
    }
    updateLiveMessages() {
        this.gameReleasesEmbedUpdater.refresh();
    }
}
exports.default = Server;
