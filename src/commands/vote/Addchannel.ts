import { APIApplicationCommandOptionChoice, ButtonInteraction, ChannelType, ChatInputCommandInteraction, Client, Guild, GuildMember, Interaction, MessageCreateOptions, MessageEditOptions, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, TextChannel, VoiceChannel } from "discord.js";
import Poll from "../../classes/Poll";
import PollSubcommand from "../../interfaces/PollSubcommand";



export default class Addchannel extends PollSubcommand  {

    constructor() {
        super("addchannel", "Add a channel");
    }

    
    onPass(poll: Poll): void {
        
    }

    onFail(poll: Poll): void {
      
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        
    }

    async onButtonPress(interaction: ButtonInteraction) {
       
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
