import { ButtonInteraction, ChatInputCommandInteraction, Client } from "discord.js"

export default interface ExecutableCommand {
    onReply(interaction: ChatInputCommandInteraction): void
    onButtonPress(interaction: ButtonInteraction): void
}