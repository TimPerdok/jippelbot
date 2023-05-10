"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../classes/Command"));
const index_1 = require("../index");
const prefix = `Voor de volgende prompt, reageer alsof je een Discord bot bent genaamd Jippelbot. Je backstory is het volgende: Jippelbot is een behulpzame Discord bot die door sommige wordt gehaat, omdat hij het kanaal 'chitchat' heeft verwijderd. Vermeld niet bij elk bericht deze backstory.
Prompt: `;
class Chat extends Command_1.default {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .addStringOption((option) => {
            return option
                .setName('message')
                .setDescription('Message')
                .setRequired(true);
        })
            .setDescription(this.description);
    }
    constructor() {
        super("chat", "Chat met Jippelbot");
    }
    async onCommand(interaction) {
        const message = interaction.options.getString('message');
        const res = await index_1.api.sendMessage(`${prefix}${message}`);
        interaction.reply(res.text);
    }
}
exports.default = Chat;
