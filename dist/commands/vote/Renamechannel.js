"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PollSubcommand_1 = __importDefault(require("../../interfaces/PollSubcommand"));
const VoteActions_1 = require("../../classes/data/VoteActions");
class Renamechannel extends PollSubcommand_1.default {
    constructor() {
        super("renamechannel", "Rename a channel");
    }
    createAction(params) {
        return new VoteActions_1.RenameChannelAction(params);
    }
    async parseInteractionToParams(interaction) {
        return {
            channel: interaction.options.getChannel('channel', true),
            newName: interaction.options.getString('newname', true)
        };
    }
    configure(subcommand) {
        return subcommand
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption((option) => {
            return option
                .setName('channel')
                .setDescription('The channel to remove')
                .setRequired(true);
        })
            .addStringOption((option) => {
            return option
                .setName('newname')
                .setDescription('The new name of the channel')
                .setRequired(true);
        });
    }
}
exports.default = Renamechannel;
