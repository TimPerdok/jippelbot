import { Guild } from "discord.js";
import { ServerConfig } from "../types/ServerdataJSON";
import GameReleaseEmbedManager from "./schedulers/GameReleasesEmbedManager";
import ServerREST from "./ServerREST";
import GameReleaseScheduler from "./schedulers/GameReleaseScheduler";
import VoteManager from "./schedulers/VoteScheduler";

export default class Server {
    
    private gameReleasesEmbedUpdater: GameReleaseEmbedManager
    private gameReleaseScheduler: GameReleaseScheduler
    private voteManager: VoteManager;

    constructor(public guild: Guild) {
        this.gameReleasesEmbedUpdater = new GameReleaseEmbedManager(this.guild.id)
        this.gameReleaseScheduler = new GameReleaseScheduler(this.guild)
        this.voteManager = new VoteManager(this.guild)
    }

    refreshLiveMessages() {
        this.gameReleasesEmbedUpdater.refresh();
    }

    reloadPolls() {
        this.voteManager.reload()
    }

    addPoll(poll: any) {
        this.voteManager.addPoll(poll)
    }
    
}