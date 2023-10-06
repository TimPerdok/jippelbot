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
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../classes/Command"));
const DataHandler_1 = __importDefault(require("../classes/datahandlers/DataHandler"));
class Ping extends Command_1.default {
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
    onCommand(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const enabled = interaction.options.getBoolean("enabled", true);
            const password = interaction.options.getString("password", true);
            if (password !== process.env.disablepass)
                return interaction.reply({ content: "Fout wachtwoord lmao", ephemeral: true });
            yield DataHandler_1.default.setServerdata(interaction.guildId, { isDalleEnabled: enabled });
            yield interaction.reply({ content: `Dall-e is now ${enabled ? "enabled" : "disabled"}`, ephemeral: true });
        });
    }
}
exports.default = Ping;
