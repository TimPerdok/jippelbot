import { ActionRowBuilder, Client, Embed, EmbedBuilder, MessageEditOptions, MessagePayload } from "discord.js"

export type DataJSON = {
    
}

export type Payload = {
    content?: string
    embeds?: EmbedBuilder[]
    components?: ActionRowBuilder[] 
}

export default interface ExecutableCommand {
    format: DataJSON
    payload: string | Payload
}