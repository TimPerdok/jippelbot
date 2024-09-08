"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PollSubcommand_1 = __importDefault(require("../../interfaces/PollSubcommand"));
const VoteActions_1 = require("../../classes/data/VoteActions");
class Kickuser extends PollSubcommand_1.default {
    constructor() {
        super("kickuser", "Kick a user");
    }
    createAction(params) {
        return new VoteActions_1.KickUserAction(params);
    }
    async parseInteractionToParams(interaction) {
        const discordUser = interaction.options.getUser('user', true);
        const guild = interaction.guild;
        if (!guild)
            throw new Error("No guild");
        const guildUser = await interaction.guild.members.fetch(discordUser.id);
        return {
            user: {
                id: guildUser.id,
                name: guildUser.displayName
            }
        };
    }
    configure(subcommand) {
        return subcommand
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) => option
            .setName('user')
            .setDescription('The user to kick')
            .setRequired(true));
    }
}
exports.default = Kickuser;
