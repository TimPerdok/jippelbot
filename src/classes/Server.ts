import { Guild } from "discord.js";
import { ServerConfig } from "../types/ServerdataJSON";
import GameReleasesEmbedUpdater from "./gamereleases/GameReleasesEmbedUpdater";
import ServerREST from "./ServerREST";
import GameReleaseScheduler from "./schedulers/GameReleaseScheduler";
import VoteScheduler from "./schedulers/VoteScheduler";

export default class Server {
    
    private gameReleasesEmbedUpdater: GameReleasesEmbedUpdater
    private gameReleaseScheduler: GameReleaseScheduler
    voteScheduler: VoteScheduler;

    constructor(public guild: Guild, private config: ServerConfig, private rest: ServerREST) {
        this.gameReleasesEmbedUpdater = new GameReleasesEmbedUpdater(this.guild.id)
        this.gameReleaseScheduler = new GameReleaseScheduler(this.guild)
        this.voteScheduler = new VoteScheduler(this.guild)
    }


    rescheduleGameReleases() {
        this.gameReleaseScheduler.reschedule()
    }

    updateLiveMessages() {
        this.gameReleasesEmbedUpdater.refresh()
    }
    
}