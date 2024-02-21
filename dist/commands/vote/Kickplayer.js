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
const PollSubcommand_1 = __importDefault(require("../../interfaces/PollSubcommand"));
const VoteActions_1 = require("../../classes/data/VoteActions");
class Kickplayer extends PollSubcommand_1.default {
    constructor() {
        super("kickplayer", "Kick a player");
    }
    createAction(params) {
        return new VoteActions_1.KickUserAction(params);
    }
    parseInteractionToParams(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const discordUser = interaction.options.getUser('user', true);
            const guild = interaction.guild;
            if (!guild)
                throw new Error("No guild");
            const guildUser = yield interaction.guild.members.fetch(discordUser.id);
            return {
                user: {
                    id: guildUser.id,
                    name: guildUser.displayName
                }
            };
        });
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
exports.default = Kickplayer;
