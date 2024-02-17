import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, MessageCreateOptions, MessagePayload, SlashCommandSubcommandBuilder } from "discord.js";
import Subcommand from "../classes/Subcommand";
import Poll from "../classes/data/Poll";

export type PollChannelType = "GUILD_TEXT" | "GUILD_VOICE"
export default abstract class PollSubcommand extends Subcommand {

    static get DEFAULT_END_DATE() {
        return Math.round(((new Date().getTime()) + 1000 * 60 * 60 * 24) / 1000)
    } 

    constructor(name: string, description: string) {
        super(name, description)
    }


}
