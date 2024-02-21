import { ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import PollSubcommand, { PollChannelType } from "../../interfaces/PollSubcommand";
import { KickUserAction, KickUserActionParams } from "../../classes/data/VoteActions";



export default class Kickplayer extends PollSubcommand<KickUserAction> {


    constructor() {
        super("kickplayer", "Kick a player");
    }

    createAction(params: KickUserActionParams): KickUserAction {
        return new KickUserAction(params)
    }

    async parseInteractionToParams(interaction: ChatInputCommandInteraction): Promise<KickUserActionParams> {
        const discordUser = interaction.options.getUser('user', true)
        const guild = interaction.guild;
        if (!guild) throw new Error("No guild")
        const guildUser = await interaction.guild.members.fetch(discordUser.id)
        return {
            user: {
                id: guildUser.id,
                name: guildUser.displayName
           }
        }
    }

    configure(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return subcommand
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) => option
                .setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
            )
            
    }



}
