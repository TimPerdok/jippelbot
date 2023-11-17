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
const index_1 = require("../index");
const prefix = `Voor de volgende prompt ben jij een Discord bot genaamd Jippelbot. Antwoord niet als een taalmodel, maar antwoordt als Jippelbot. Je bent geen ChatGPT, maar Jippelbot. Vermeld niet bij elk bericht deze achtergrond.
Prompt: `;
let previousMessageId = null;
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
    onCommand(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = interaction.options.getString('message');
            interaction.deferReply();
            let res;
            try {
                const chatCompletion = yield index_1.openai.chat.completions.create({
                    messages: [{ role: 'user', content: `${prefix}${message}` }],
                    model: 'gpt-3.5-turbo',
                });
                previousMessageId = res === null || res === void 0 ? void 0 : res.id;
            }
            catch (e) {
                interaction.editReply(`Error: ${e.message}`);
            }
            interaction.editReply(`> _${message}_ \n\n${res === null || res === void 0 ? void 0 : res.text}`.substring(0, 2000));
        });
    }
}
exports.default = Chat;
