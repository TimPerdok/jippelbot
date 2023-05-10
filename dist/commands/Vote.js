"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../classes/Command"));
const DataHandler_1 = __importDefault(require("../classes/datahandlers/DataHandler"));
class Vote extends Command_1.default {
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.subcommands.forEach((subcommand) => {
            builder.addSubcommand(subcommand.data.bind(subcommand));
        });
        return builder;
    }
    constructor() {
        super("vote", "Start a vote");
    }
    async onButtonPress(interaction) {
        const subcommand = this.subcommands.get((await DataHandler_1.default.getPoll(interaction.message.id)).command.split("/")[1]);
        if (subcommand)
            return subcommand.onButtonPress(interaction);
    }
    async onCommand(interaction) {
        const subcommand = this.subcommands.get(interaction.options.getSubcommand());
        if (subcommand)
            return subcommand.onCommand(interaction);
    }
}
exports.default = Vote;
