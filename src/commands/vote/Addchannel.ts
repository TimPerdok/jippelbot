import { APIApplicationCommandOptionChoice, ButtonInteraction, ChannelType, ChatInputCommandInteraction, Client, Guild, GuildMember, Interaction, MessageCreateOptions, MessageEditOptions, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, TextChannel, VoiceChannel } from "discord.js";
import DiscordBot from "../../classes/Bot";
import DataHandler from "../../classes/datahandlers/DataHandler";
import Poll from "../../classes/Poll";
import Subcommand from "../../classes/Subcommand";
import PollCarrier from "../../interfaces/PollCarrier";
import PollSubcommand from "../../interfaces/PollCarrier";
import { ServerdataJSON } from "../../types/ServerdataJSON";



export default class Addchannel extends PollSubcommand  {


    constructor() {
        super("addchannel", "Add a channel", "vote");
    }

    
    onPass(poll: Poll): void {
        const guild: Guild = DiscordBot.client.guilds.cache.get(poll.message.guild.id) as Guild
        (DataHandler.getServerdata(guild.id)).then((serverData: ServerdataJSON)=>{
            const parent = poll.params.type === "GUILD_TEXT" ? serverData.textChannelCategory : serverData.voiceChannelCategory
            poll.message.edit({
                embeds: [],
                components: [],
                content: `Het kanaal ${poll.params.newName} is aangemaakt!`
            })
            guild.channels.create({
                name: poll.params.newName,
                type: poll.params.type === "GUILD_TEXT" ? ChannelType.GuildText : ChannelType.GuildVoice,
                parent
            })

        })
        
    }
    onFail(poll: Poll): void {
        poll.message.edit({
            embeds: [],
            components: [],
            content: `Deze vote is niet doorgevoerd. ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel})`
        })
    }


    async onCommand(interaction: ChatInputCommandInteraction) {
        const channels = (interaction.member as GuildMember).guild.channels.cache
        const newName = interaction.options.getString('name')
        const type = interaction.options.getString('channeltype')
        const typeLabel = type === "GUILD_TEXT" ? "textchannel" : "voicechannel"
        const poll = new Poll({
            question: `Moet de ${typeLabel}, '${newName}' worden aangemaakt?`,
            initiator: interaction.member as GuildMember,
            command: this,
            params: { newName, type}
        });
        const serverData = await DataHandler.getServerdata(interaction.guildId as string) as ServerdataJSON
        const voteChannel = channels.get(serverData.voteChannel) as TextChannel
        await interaction.reply({ content: "Je vote is aangemaakt!", ephemeral: true }) as MessageEditOptions
        const message = await voteChannel.send({ ...poll.payload, fetchReply: true } as MessageCreateOptions);
        poll.setMessage(message)
        this.polls.set(message.id, poll)
    }

    async onButtonPress(interaction: ButtonInteraction) {
        const poll = this.polls.get(interaction.message.id)
        if (!poll) return
        const done = poll.addCount(interaction.member as GuildMember, interaction.customId === 'yes')
        if (!done) poll.updateMessage(interaction)
    }


    data(subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
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
