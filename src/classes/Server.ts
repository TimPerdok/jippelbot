import { Guild } from "discord.js";
import GameReleaseScheduler from "./schedulers/GameReleaseScheduler";
import GameReleaseEmbedManager from "./schedulers/GameReleasesEmbedManager";

export default class Server {
    
    private gameReleasesEmbedUpdater: GameReleaseEmbedManager
    private gameReleaseScheduler: GameReleaseScheduler

    constructor(public guild: Guild) {
        this.gameReleasesEmbedUpdater = new GameReleaseEmbedManager(this.guild.id)
        this.gameReleaseScheduler = new GameReleaseScheduler(this.guild)
    }

    refreshLiveMessages() {
        this.gameReleasesEmbedUpdater.refresh();
    }
    
}