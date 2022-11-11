import { Client, MessageEditOptions, MessagePayload } from "discord.js"

export type DataJSON = {
    
}

export type Payload = {
    content?: string
    embeds?: any[]
    components?: any[]
}

export default interface ExecutableCommand {
    format: DataJSON
    payload: string | Payload
}