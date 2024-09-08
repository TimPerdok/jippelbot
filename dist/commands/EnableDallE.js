"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../classes/Command"));
const Bot_1 = __importDefault(require("../classes/Bot"));
class EnableDallE extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addBooleanOption(option => option.setName("enabled").setDescription("Enable or disable dall-e").setRequired(true))
            .addStringOption(option => option.setName("password").setDescription("Pasword").setRequired(true));
    }
    constructor() {
        super("enabledalle", "Enable or disable dall-e");
    }
    async onCommand(interaction) {
        const enabled = interaction.options.getBoolean("enabled", true);
        const password = interaction.options.getString("password", true);
        if (password !== process.env.disablepass)
            return interaction.reply({ content: "Fout wachtwoord lmao", ephemeral: true });
        const serverdata = Bot_1.default.getInstance().dataHandlers.serverdata.getAllOfServer(interaction.guildId ?? "");
        serverdata.isDalleEnabled = enabled;
        Bot_1.default.getInstance().dataHandlers.serverdata.overwrite(interaction.guildId ?? "", serverdata);
        interaction.reply({ content: `Dall-e is now ${enabled ? "enabled" : "disabled"}`, ephemeral: true });
    }
}
exports.default = EnableDallE;
