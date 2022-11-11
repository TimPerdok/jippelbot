import { Client } from "discord.js"

export default interface ExecutableCommand {
    onReply(interaction: any): any
    onButtonPress(interaction: any): any
}