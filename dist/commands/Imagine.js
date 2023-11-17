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
const index_1 = require("../index");
const node_fetch_1 = __importDefault(require("node-fetch"));
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield DataHandler_1.default.getServerdata(interaction.guildId)).isDalleEnabled)
                return yield interaction.reply("Joop zijn euro's zijn op. Momenteel kunnen er geen afbeeldingen gegenereerd worden.");
            const prompt = interaction.options.getString("prompt");
            interaction.deferReply();
            try {
                const response = yield index_1.openai.images.generate({
                    prompt,
                    model: "dall-e-3",
                    n: 1,
                    size: "1024x1024",
                    response_format: "url"
                });
                const imageBuffer = yield (yield (0, node_fetch_1.default)((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a[0].url)).arrayBuffer();
                yield interaction.editReply({
                    content: `Daar gaat weer 2 cent van Joop... \nPrompt is ${prompt}. `,
                    files: [{ attachment: Buffer.from(imageBuffer), name: "image.png" }]
                });
            }
            catch (error) {
                console.error(error);
                yield interaction.editReply({ content: `Oh nee een error. \nPrompt was ${prompt}. \n${(_b = error === null || error === void 0 ? void 0 : error.error) === null || _b === void 0 ? void 0 : _b.message}` });
            }
        });
    }
}
exports.default = Summon;
