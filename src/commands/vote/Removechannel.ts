import { ChatInputCommandInteraction, SlashCommandChannelOption, SlashCommandSubcommandBuilder } from "discord.js";
import PollSubcommand from "../../interfaces/PollSubcommand";
import { RemoveChannelAction, RemoveChannelActionParams } from "../../classes/data/VoteActions";



export default class Removechannel extends PollSubcommand<RemoveChannelAction> {
   

    constructor() {
        super("removechannel", "Remove a channel");
    }

    createAction(params: RemoveChannelActionParams): RemoveChannelAction {
       return new RemoveChannelAction(params)
    }

    parseInteractionToParams(interaction: ChatInputCommandInteraction): RemoveChannelActionParams {
        return {
            channel: interaction.options.getChannel('channel', true)
        }
    }

    configure(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return subcommand
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption((option: SlashCommandChannelOption) => {
                return option
                    .setName('channel')
                    .setDescription('The channel to remove')
                    .setRequired(true)
            })
    }



}
