"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../classes/Command"));
const Addchannel_1 = __importDefault(require("./vote/Addchannel"));
const Removechannel_1 = __importDefault(require("./vote/Removechannel"));
const Renamechannel_1 = __importDefault(require("./vote/Renamechannel"));
const Kickuser_1 = __importDefault(require("./vote/Kickuser"));
class Vote extends Command_1.default {
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.subcommands.forEach((subcommand) => {
            builder.addSubcommand(subcommand.configure.bind(subcommand));
        });
        return builder;
    }
    constructor() {
        super("vote", "Start a vote", [
            new Addchannel_1.default(),
            new Removechannel_1.default(),
            new Renamechannel_1.default(),
            new Kickuser_1.default(),
        ]);
    }
    async onCommand(interaction) {
        const subcommand = this.subcommands.find(subcommand => subcommand.name === interaction.options.getSubcommand());
        if (subcommand)
            return subcommand.onCommand(interaction);
    }
}
exports.default = Vote;
