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
const Bot_1 = __importDefault(require("../../classes/Bot"));
const DataHandler_1 = __importDefault(require("../../classes/datahandlers/DataHandler"));
const Poll_1 = __importDefault(require("../../classes/Poll"));
const PollCarrier_1 = __importDefault(require("../../interfaces/PollCarrier"));
class Addchannel extends PollCarrier_1.default {
    constructor() {
        super("kick", "Kick a person", "vote");
    }
    onPass(poll) {
        var _a, _b;
        const guild = Bot_1.default.client.guilds.cache.get((_b = (_a = poll.message.guild) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "");
        const userId = poll.params.userId;
        const member = guild.members.cache.get(userId);
        try {
            member.kick();
            poll.message.edit({
                embeds: [],
                components: [],
                content: `De user ${member.displayName} is gekickt! ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel})`
            });
        }
        catch (error) {
            poll.message.edit({
                embeds: [],
                components: [],
                content: `Deze vote zou doorgevoerd worden maar er is een error ontstaan. ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel}). Error: ${error.message}`
            });
        }
    }
    onFail(poll) {
        poll.message.edit({
            embeds: [],
            components: [],
            content: `Deze vote is niet doorgevoerd. ${poll.yesCount} voor en ${poll.noCount} tegen. (${poll.percentageLabel})`
        });
    }
    onCommand(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const channels = interaction.member.guild.channels.cache;
            const user = interaction.options.getUser('user');
            const poll = new Poll_1.default({
                question: `Moet de user ${user.username} gekickt worden?`,
                initiator: interaction.member,
                command: this,
                params: { userId: user.id }
            });
            const serverData = yield DataHandler_1.default.getServerdata(interaction.guildId);
            const voteChannel = channels.get(serverData.voteChannel);
            yield interaction.reply({ content: "Je vote is aangemaakt!", ephemeral: true });
            const message = yield voteChannel.send(Object.assign(Object.assign({}, poll.payload), { fetchReply: true }));
            poll.setMessage(message);
            this.polls.set(message.id, poll);
        });
    }
    onButtonPress(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const poll = this.polls.get(interaction.message.id);
            if (!poll)
                return;
            const done = poll.addCount(interaction.member, interaction.customId === 'yes');
            if (!done)
                poll.updateMessage(interaction);
        });
    }
    data(subcommand) {
        return subcommand
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true));
    }
}
exports.default = Addchannel;
