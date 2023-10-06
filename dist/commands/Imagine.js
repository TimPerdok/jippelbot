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
class Summon extends Command_1.default {
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("prompt").setDescription("De prompt voor de afbeelding").setRequired(true));
        return builder;
    }
    constructor() {
        super("imagine", "Imagine een afbeelding");
    }
    onCommand(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = interaction.options.getString("prompt");
            interaction.deferReply();
            const response = yield index_1.openai.images.generate({
                prompt,
                n: 1,
                size: "1024x1024",
                response_format: "url"
            });
            console.log(response);
            yield interaction.editReply({ content: `Daar gaat weer 2 cent van Joop... \nPrompt is ${prompt}. \n${(_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a[0].url} ` });
        });
    }
}
exports.default = Summon;
