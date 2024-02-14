import { Guild } from "discord.js";
import { ServerConfig } from "../types/ServerdataJSON";
import GameReleasesEmbedUpdater from "./gamereleases/GameReleaseUpdater";
import ServerREST from "./ServerREST";
import Command from "./Command";
import Scheduler from "./Scheduler";
import DiscordBot from "./Bot";
import GameReleaseScheduler from "./gamereleases/GameReleaseScheduler";

export default class Server {
    
    private gameReleasesEmbedUpdater: GameReleasesEmbedUpdater
    private gameReleaseScheduler: GameReleaseScheduler

    constructor(public guild: Guild, private config: ServerConfig, private rest: ServerREST) {
        this.gameReleasesEmbedUpdater = new GameReleasesEmbedUpdater(this.guild.id)
        this.gameReleaseScheduler = new GameReleaseScheduler(this.guild)
    }


    rescheduleGameReleases() {
        this.gameReleaseScheduler.reschedule()
    }

    updateLiveMessages() {
        this.gameReleasesEmbedUpdater.refresh()
    }
    
}