import { Client } from "discord.js"

export default interface ExecutableCommand {
    onReply(client: Client, interaction: any): any
    onButtonPress(client: Client, interaction: any): any
}