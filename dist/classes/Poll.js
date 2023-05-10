"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const DataHandler_1 = __importDefault(require("./datahandlers/DataHandler"));
class Poll {
    command;
    question;
    initiator;
    message;
    votes;
    startTimestampUnix;
    maxTime = 86400;
    minimumPercentage = 0.50;
    params = {};
    done = false;
    get timeLeft() {
        return (this.startTimestampUnix + this.maxTime) * 1000 - Date.now();
    }
    constructor({ question, initiator, command, params, startTimestampUnix, votes, message }) {
        this.question = question;
        this.initiator = initiator;
        this.command = command;
        this.startTimestampUnix = startTimestampUnix ?? Math.round(Date.now() / 1000);
        this.votes = votes ?? new Map();
        this.message = message;
        this.params = params;
        if (message)
            this.updateData();
        setTimeout(async () => {
            if (this.done)
                return;
            this.done = true;
            if (this.percentage > this.minimumPercentage) {
                try {
                    this.command.onPass(this);
                    DataHandler_1.default.removePoll(this.message.id);
                }
                catch (e) {
                    console.error(e);
                }
            }
            else {
                this.command.onFail(this);
                DataHandler_1.default.removePoll(this.message.id);
            }
        }, this.timeLeft > 0 ? this.timeLeft : 0);
    }
    get voteCount() {
        return [...this.votes.values()].length;
    }
    get percentage() {
        if (!this.yesCount && !this.noCount)
            return 0;
        const pct = this.yesCount / (this.yesCount + this.noCount);
        if (!isNaN(pct))
            return pct;
        return 0;
    }
    get percentageLabel() {
        return `${Math.round(this.percentage * 100)}%`;
    }
    get yesCount() {
        return [...this.votes.values()].filter((vote) => vote).length;
    }
    get noCount() {
        return [...this.votes.values()].filter((vote) => !vote).length;
    }
    updateData() {
        DataHandler_1.default.setPoll(this.format);
    }
    setMessage(message) {
        this.message = message;
        this.updateData();
    }
    addCount(user, value = false) {
        this.votes.set(user.id, value);
        this.updateData();
        if (this.yesCount > 5) {
            this.done = true;
            this.command.onPass(this);
            DataHandler_1.default.removePoll(this.message.id);
            return true;
        }
        return false;
    }
    getEndTime() {
        return `<t:${this.startTimestampUnix + this.maxTime}>`;
    }
    get payload() {
        return {
            embeds: [new discord_js_1.EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${this.initiator.nickname ?? this.initiator.user.username} heeft een vote gestart.`)
                    .setDescription(this.question)
                    .addFields({ name: 'Voor:', value: this.yesCount + "", inline: true }, { name: 'Tegen:', value: this.noCount + "", inline: true }, { name: 'Totaal:', value: this.percentageLabel + "", inline: true }, { name: 'Vote eindigt op:', value: this.getEndTime() })
            ], components: [
                new discord_js_1.ActionRowBuilder()
                    .addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId('yes')
                    .setLabel('Ja')
                    .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                    .setCustomId('no')
                    .setLabel('Nee')
                    .setStyle(discord_js_1.ButtonStyle.Danger))
            ]
        };
    }
    async updateMessage(interaction) {
        await this.message.edit(this.payload);
        interaction.update({ fetchReply: true });
    }
    get format() {
        return {
            question: this.question,
            initiatorId: this.initiator.user.id,
            votes: Object.fromEntries(this.votes),
            startTimestampUnix: this.startTimestampUnix,
            command: `${this.command.parentCommand}/${this.command.name}`,
            messageId: this.message.id,
            channelId: this.message.channelId,
            params: {
                ...this.params
            }
        };
    }
}
exports.default = Poll;
