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
class Summon extends Command_1.default {
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName("user").setDescription("De persoon die je wilt summonen").setRequired(true));
        return builder;
    }
    constructor() {
        super("summon", "Summon iemand");
    }
    onCommand(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const user = interaction.options.getUser("user", true);
            yield user.send(`Je wordt gesummoned door ${interaction.user.username} in ${(_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.name}. Klik <#${interaction.channelId}> om te reageren.`);
            yield interaction.reply({ content: `Je hebt ${user.username} gesummoned.`, ephemeral: true });
        });
    }
}
exports.default = Summon;
