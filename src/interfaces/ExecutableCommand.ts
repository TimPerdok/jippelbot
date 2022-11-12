import { ButtonInteraction, ChatInputCommandInteraction, Client } from "discord.js"

export default interface ExecutableCommand {
    onCommand(interaction: ChatInputCommandInteraction): void
    onButtonPress(interaction: ButtonInteraction): void
}