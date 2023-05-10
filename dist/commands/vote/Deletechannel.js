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
class Deletechannel extends PollCarrier_1.default {
    constructor() {
        super("deletechannel", "Delete a channel", "vote");
    }
    onPass(poll) {
        const channel = Bot_1.default.client.channels.cache.get(poll.params.channelId);
        poll.message.edit({
            embeds: [],
            components: [],
            content: `Het kanaal ${channel.name} is verwijderd!`
        });
        channel.delete();
    }
    onFail(poll) {
        poll.message.edit({
            embeds: [],
            components: [],
            content: `Deze vote is niet doorgevoerd.`
        });
    }
    onCommand(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const channels = interaction.member.guild.channels.cache;
            const toBeDeletedChannel = channels.get(interaction.options.getChannel('channel').id);
            const poll = new Poll_1.default({
                question: `Moet het kanaal ${toBeDeletedChannel} verwijderd worden?`,
                initiator: interaction.member,
                command: this,
                params: { channelId: toBeDeletedChannel.id }
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
            .addChannelOption((option) => {
            return option
                .setName('channel')
                .setDescription('The channel to rename')
                .setRequired(true);
        });
    }
}
exports.default = Deletechannel;
