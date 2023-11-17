"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const DataHandler_1 = __importDefault(require("./datahandlers/DataHandler"));
class Poll {
    get timeLeft() {
        return (this.startTimestampUnix + this.maxTime) * 1000 - Date.now();
    }
    constructor({ question, initiator, command, params, startTimestampUnix, votes, message }) {
        this.maxTime = 86400;
        this.minimumPercentage = 0.50;
        this.debug = false;
        this.params = {};
        this.done = false;
        this.question = question;
        this.initiator = initiator;
        this.command = command;
        this.startTimestampUnix = startTimestampUnix !== null && startTimestampUnix !== void 0 ? startTimestampUnix : Math.round(Date.now() / 1000);
        this.votes = votes !== null && votes !== void 0 ? votes : new Map();
        this.message = message;
        this.params = params;
        if (message)
            this.updateData();
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            if (this.done)
                return;
            this.done = true;
            if (this.percentage > this.minimumPercentage || this.debug) {
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
        }), this.timeLeft > 0 ? this.timeLeft : 0);
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
        if (this.yesCount > 5 || this.debug) {
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
        var _a;
        return {
            embeds: [new discord_js_1.EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`${(_a = this.initiator.nickname) !== null && _a !== void 0 ? _a : this.initiator.user.username} heeft een vote gestart.`)
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
    updateMessage(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.message.edit(this.payload);
            interaction.update({ fetchReply: true });
        });
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
            params: Object.assign({}, this.params)
        };
    }
}
exports.default = Poll;
