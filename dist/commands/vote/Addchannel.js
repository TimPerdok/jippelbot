"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Bot_1 = __importDefault(require("../../classes/Bot"));
const DataHandler_1 = __importDefault(require("../../classes/datahandlers/DataHandler"));
const Poll_1 = __importDefault(require("../../classes/Poll"));
const PollCarrier_1 = __importDefault(require("../../interfaces/PollCarrier"));
class Addchannel extends PollCarrier_1.default {
    constructor() {
        super("addchannel", "Add a channel", "vote");
    }
    onPass(poll) {
        const guild = Bot_1.default.client.guilds.cache.get(poll.message.guild.id);
        (DataHandler_1.default.getServerdata(guild.id)).then((serverData) => {
            const parent = poll.params.type === "GUILD_TEXT" ? serverData.textChannelCategory : serverData.voiceChannelCategory;
            poll.message.edit({
                embeds: [],
                components: [],
                content: `Het kanaal ${poll.params.newName} is aangemaakt!`
            });
            guild.channels.create({
                name: poll.params.newName,
                type: poll.params.type === "GUILD_TEXT" ? discord_js_1.ChannelType.GuildText : discord_js_1.ChannelType.GuildVoice,
                parent
            });
        });
    }
    onFail(poll) {
        poll.message.edit({
            embeds: [],
            components: [],
            content: `Deze vote is niet doorgevoerd.`
        });
    }
    async onCommand(interaction) {
        const channels = interaction.member.guild.channels.cache;
        const newName = interaction.options.getString('name');
        const type = interaction.options.getString('channeltype');
        const typeLabel = type === "GUILD_TEXT" ? "textchannel" : "voicechannel";
        const poll = new Poll_1.default({
            question: `Moet de ${typeLabel}, '${newName}' worden aangemaakt?`,
            initiator: interaction.member,
            command: this,
            params: { newName, type }
        });
        const serverData = await DataHandler_1.default.getServerdata(interaction.guildId);
        const voteChannel = channels.get(serverData.voteChannel);
        await interaction.reply({ content: "Je vote is aangemaakt!", ephemeral: true });
        const message = await voteChannel.send({ ...poll.payload, fetchReply: true });
        poll.setMessage(message);
        this.polls.set(message.id, poll);
    }
    async onButtonPress(interaction) {
        const poll = this.polls.get(interaction.message.id);
        if (!poll)
            return;
        const done = poll.addCount(interaction.member, interaction.customId === 'yes');
        if (!done)
            poll.updateMessage(interaction);
    }
    data(subcommand) {
        return subcommand
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => {
            return option
                .setName('name')
                .setDescription('The new name of the channel')
                .setRequired(true);
        })
            .addStringOption((option) => {
            return option
                .setName('channeltype')
                .setDescription('Type of the channel')
                .setRequired(true)
                .setChoices({
                name: 'Text',
                value: "GUILD_TEXT"
            }, {
                name: 'Voice',
                value: "GUILD_VOICE"
            });
        });
    }
}
exports.default = Addchannel;
