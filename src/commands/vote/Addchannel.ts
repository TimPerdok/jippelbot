import { ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import PollSubcommand, { PollChannelType } from "../../interfaces/PollSubcommand";
import { AddChannelAction, AddChannelActionParams } from "../../classes/data/VoteActions";



export default class Addchannel extends PollSubcommand<AddChannelAction> {


    constructor() {
        super("addchannel", "Add a channel");
    }

    createAction(params: AddChannelActionParams): AddChannelAction {
       return new AddChannelAction(params)
    }

    parseInteractionToParams(interaction: ChatInputCommandInteraction): AddChannelActionParams {
        return {
            channelType: interaction.options.getString('channeltype', true) as PollChannelType,
            name: interaction.options.getString('name', true)
        }
    }

    configure(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return subcommand
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option: SlashCommandStringOption) => {
                return option
                    .setName('name')
                    .setDescription('The new name of the channel')
                    .setRequired(true)
            })
            .addStringOption((option: SlashCommandStringOption) => {
                return option
                    .setName('channeltype')
                    .setDescription('Type of the channel')
                    .setRequired(true)
                    .setChoices({
                        name: 'Text',
                        value: "GUILD_TEXT"
                    },
                        {
                            name: 'Voice',
                            value: "GUILD_VOICE"
                        })
            })
    }



}
