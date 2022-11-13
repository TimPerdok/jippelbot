import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildMember } from "discord.js";
import Poll from "../classes/Poll";

export default interface PollCarrier {

    onPass(poll: Poll): void
    onFail(poll: Poll): void

}
