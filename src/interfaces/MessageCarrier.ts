import { ActionRowBuilder, Client, Embed, EmbedBuilder, MessageEditOptions, MessagePayload } from "discord.js"
import { PollJSON } from "../types/PollJSON"
import { ServerdataJSON } from "../types/ServerdataJSON"
import { Game } from "../api/IGDB"
import { TwitchAccessTokenJSON } from "../api/TwitchAccessToken"

export type DataJSON =  Item | IdentifiableItem[]

export type Item = ServerdataJSON | TwitchAccessTokenJSON

export type IdentifiableItem = PollJSON | Game

export type Payload = {
    content?: string
    embeds?: EmbedBuilder[]
    components?: ActionRowBuilder[] 
}

export default interface MessageCarrier {
    format: DataJSON
    payload: string | Payload
}