import { ActionRowBuilder, Client, Embed, EmbedBuilder, MessageEditOptions, MessagePayload } from "discord.js"
import { PollJSON } from "../types/PollJSON"
import { ServerdataJSON } from "../types/ServerdataJSON"
import { Game } from "../api/IGDBApi"
import { TwitchAccessTokenJSON } from "../api/TwitchAccessToken"

export type DataJSON = PollJSON | ServerdataJSON | Game[] | TwitchAccessTokenJSON

export type Payload = {
    content?: string
    embeds?: EmbedBuilder[]
    components?: ActionRowBuilder[] 
}

export default interface ExecutableCommand {
    format: DataJSON
    payload: string | Payload
}