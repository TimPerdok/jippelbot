import { ChatInputCommandInteraction, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import PollSubcommand, { PollChannelType } from "../../interfaces/PollSubcommand";
import { RenameChannelAction, RenameChannelActionParams } from "../../classes/data/VoteActions";



export default class Renamechannel extends PollSubcommand<RenameChannelAction> {


    constructor() {
        super("renamechannel", "Rename a channel");
    }

    createAction(params: RenameChannelActionParams): RenameChannelAction {
        return new RenameChannelAction(params)
    }

    async parseInteractionToParams(interaction: ChatInputCommandInteraction): Promise<RenameChannelActionParams> {
        return {
            channel: interaction.options.getChannel('channel', true),
            newName: interaction.options.getString('newname', true)
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
            .addStringOption((option: SlashCommandStringOption) => {
                return option
                    .setName('newname')
                    .setDescription('The new name of the channel')
                    .setRequired(true)
            })
            
    }



}
