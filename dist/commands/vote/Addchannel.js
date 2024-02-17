"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PollSubcommand_1 = __importDefault(require("../../interfaces/PollSubcommand"));
const VoteActions_1 = require("../../classes/data/VoteActions");
class Addchannel extends PollSubcommand_1.default {
    constructor() {
        super("addchannel", "Add a channel");
    }
    createAction(params) {
        return new VoteActions_1.AddChannelAction(params);
    }
    parseInteractionToParams(interaction) {
        return {
            channelType: interaction.options.getString('channeltype', true),
            name: interaction.options.getString('name', true)
        };
    }
    configure(subcommand) {
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
