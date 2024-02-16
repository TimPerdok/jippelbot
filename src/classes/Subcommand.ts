import { ButtonInteraction, ChatInputCommandInteraction, Client, Interaction, SlashCommandSubcommandBuilder } from "discord.js";
import ExecutableCommand from "../interfaces/ExecutableCommand";


export default abstract class Subcommand implements ExecutableCommand {

    abstract configure(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder

    constructor(public name: string, public description: string) {
    }

    abstract onCommand(interaction: ChatInputCommandInteraction): void
    abstract onButtonPress(interaction: ButtonInteraction): void

}
