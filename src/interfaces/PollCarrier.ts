import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, SlashCommandSubcommandBuilder } from "discord.js";
import JSONDataHandler from "../classes/datahandlers/JSONDataHandler";
import Poll from "../classes/Poll";
import Subcommand from "../classes/Subcommand";

export default abstract class PollSubcommand extends Subcommand {

    polls: Map<string, Poll>

    constructor(name: string, description: string, parentCommand: string) {
        super(name, description, parentCommand)
        this.polls = new Map<string, Poll>();
        JSONDataHandler.getPolls(this).then((polls: Map<string, Poll>) => {
            this.polls = polls
        })
    }

    abstract data(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder


    onCommand(interaction: ChatInputCommandInteraction<CacheType>): void {
        throw new Error("Method not implemented.");
    }
    onButtonPress(interaction: ButtonInteraction<CacheType>): void {
        throw new Error("Method not implemented.");
    }



    abstract onPass(poll: Poll): void
    abstract onFail(poll: Poll): void

}
