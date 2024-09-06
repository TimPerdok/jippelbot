"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameReleasesEmbedManager_1 = __importDefault(require("./schedulers/GameReleasesEmbedManager"));
const GameReleaseScheduler_1 = __importDefault(require("./schedulers/GameReleaseScheduler"));
const VoteScheduler_1 = __importDefault(require("./schedulers/VoteScheduler"));
class Server {
    constructor(guild) {
        this.guild = guild;
        this.gameReleasesEmbedUpdater = new GameReleasesEmbedManager_1.default(this.guild.id);
        this.gameReleaseScheduler = new GameReleaseScheduler_1.default(this.guild);
        this.voteManager = new VoteScheduler_1.default(this.guild);
    }
    refreshLiveMessages() {
        this.gameReleasesEmbedUpdater.refresh();
    }
    reloadPolls() {
        this.voteManager.reload();
    }
    addPoll(poll) {
        this.voteManager.addPoll(poll);
    }
}
exports.default = Server;
