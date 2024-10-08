"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Subcommand_1 = __importDefault(require("../classes/Subcommand"));
const Poll_1 = __importDefault(require("../classes/data/polls/Poll"));
const Bot_1 = __importDefault(require("../classes/Bot"));
const CustomIdentifier_1 = __importDefault(require("../classes/CustomIdentifier"));
const PollEmbed_1 = __importDefault(require("../classes/data/polls/PollEmbed"));
var TimeUnits;
(function (TimeUnits) {
    TimeUnits[TimeUnits["SECOND"] = 1] = "SECOND";
    TimeUnits[TimeUnits["MINUTE"] = 60] = "MINUTE";
    TimeUnits[TimeUnits["HOUR"] = 3600] = "HOUR";
    TimeUnits[TimeUnits["DAY"] = 86400] = "DAY";
    TimeUnits[TimeUnits["WEEK"] = 604800] = "WEEK";
    TimeUnits[TimeUnits["MONTH"] = 2592000] = "MONTH";
    TimeUnits[TimeUnits["YEAR"] = 31536000] = "YEAR";
})(TimeUnits || (TimeUnits = {}));
class PollSubcommand extends Subcommand_1.default {
    static get DEFAULT_END_DATE() {
        return Math.round(((new Date().getTime()) + TimeUnits.DAY * 1000) / 1000);
    }
    constructor(name, description) {
        super(name, description);
    }
    async onCommand(interaction) {
        const params = await this.parseInteractionToParams(interaction);
        const poll = Poll_1.default.new(this.createAction(params), PollSubcommand.DEFAULT_END_DATE, interaction.user.id, interaction.channelId);
        const guildId = interaction.guildId;
        if (!guildId)
            return console.error("No guildId");
        const embed = PollEmbed_1.default.create(poll, interaction.user);
        const channel = interaction.channel;
        if (!channel)
            return console.error("No channel");
        const message = await channel.send({
            embeds: [embed], components: [
                new discord_js_1.ActionRowBuilder()
                    .addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(CustomIdentifier_1.default.toCustomId({
                    command: "vote",
                    subcommand: this.name,
                    payload: {
                        isYes: true
                    }
                }))
                    .setLabel('Ja')
                    .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                    .setCustomId(CustomIdentifier_1.default.toCustomId({
                    command: "vote",
                    subcommand: this.name,
                    payload: {
                        isYes: false
                    }
                }))
                    .setLabel('Nee')
                    .setStyle(discord_js_1.ButtonStyle.Danger))
            ]
        });
        poll.save(message.id);
        interaction.reply({ content: "Vote aangemaakt!", ephemeral: true });
    }
    async onButtonPress(interaction) {
        const isYes = CustomIdentifier_1.default.fromCustomId(interaction.customId).payload.isYes;
        const guildId = interaction.guildId;
        if (!guildId)
            return console.error("No guildId");
        const messageId = interaction.message.id;
        if (!messageId)
            return console.error("No messageId");
        interaction.deferUpdate();
        const poll = Poll_1.default.fromJson(await Bot_1.default.getInstance().dataHandlers.poll.getItem(guildId, messageId));
        if (!poll)
            return console.error("No poll");
        poll.addVote(interaction.user.id, isYes);
        const pollEmbed = PollEmbed_1.default.fromEmbed(interaction.message.embeds[0], poll);
        if (!interaction.channel)
            return console.error("No channel");
        const voteMessage = interaction.message.channel.messages.cache.get(poll.id);
        voteMessage?.edit({ embeds: [pollEmbed] });
    }
}
exports.default = PollSubcommand;
