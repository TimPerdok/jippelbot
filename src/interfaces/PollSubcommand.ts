import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, MessageCreateOptions, MessagePayload, SlashCommandSubcommandBuilder } from "discord.js";
import Subcommand from "../classes/Subcommand";
import DiscordBot from "../classes/Bot";

export default abstract class PollSubcommand extends Subcommand {

    constructor(name: string, description: string) {
        super(name, description)
    }

    abstract configure(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder

    abstract onCommand(interaction: ChatInputCommandInteraction<CacheType>): void 
    abstract onButtonPress(interaction: ButtonInteraction<CacheType>): void

    abstract onPass(poll: Poll): void
    abstract onFail(poll: Poll): void

}
