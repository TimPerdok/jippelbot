import { ButtonInteraction, ChatInputCommandInteraction, Client, Collection, DiscordAPIError, GuildChannelManager, Interaction, InteractionResponse, parseWebhookURL, SlashCommandBuilder, TextChannel } from "discord.js";
import Command from "../classes/Command";
import Subcommand from "../classes/Subcommand";
import CustomIdentifier from "../classes/CustomIdentifier";
import Addchannel from "./vote/Addchannel";
import Removechannel from "./vote/Removechannel";

export default class Vote extends Command {

    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        this.subcommands.forEach((subcommand: Subcommand) => {
            builder.addSubcommand(subcommand.configure.bind(subcommand))
        })
        return builder
    }
    
    constructor() {
        super("vote", "Start a vote", [
            new Addchannel(),
            new Removechannel()
        ]);
    }

    
    async onCommand(interaction: ChatInputCommandInteraction) {
        const subcommand = this.subcommands.find(subcommand => subcommand.name === interaction.options.getSubcommand())
        if (subcommand) return subcommand.onCommand(interaction)
	}

}
