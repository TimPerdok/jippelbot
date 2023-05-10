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
class Renamechannel extends PollCarrier_1.default {
    constructor() {
        super("renamechannel", "Rename a channel", "vote");
    }
    onPass(poll) {
        const channel = Bot_1.default.client.channels.cache.get(poll.params.channelId);
        poll.message.edit({
            embeds: [],
            components: [],
            content: `De naam van het kanaal ${channel.name} is veranderd naar '${poll.params.newName}!'`
        });
        channel.setName(poll.params.newName);
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
            const toBeRenamedChannel = channels.get(interaction.options.getChannel('channel').id);
            const newName = interaction.options.getString('name');
            const poll = new Poll_1.default({
                question: `Moet het kanaal ${toBeRenamedChannel} vernoemd worden naar '${newName}'`,
                initiator: interaction.member,
                command: this,
                params: { newName, channelId: toBeRenamedChannel.id }
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
        })
            .addStringOption((option) => {
            return option
                .setName('name')
                .setDescription('The new name of the channel')
                .setRequired(true);
        });
    }
}
exports.default = Renamechannel;
