"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../classes/Command"));
const index_1 = require("../index");
const node_fetch_1 = __importDefault(require("node-fetch"));
const Bot_1 = __importDefault(require("../classes/Bot"));
class Imagine extends Command_1.default {
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
    async onCommand(interaction) {
        const serverdata = await Bot_1.default.getInstance().dataHandlers.serverdata.getAllOfServer(interaction.guildId ?? "");
        if (!serverdata.isDalleEnabled)
            return interaction.reply({ content: "Dall-e is niet enabled op deze server", ephemeral: true });
        const prompt = interaction.options.getString("prompt", true);
        interaction.deferReply();
        try {
            const response = await index_1.openai.images.generate({
                prompt,
                model: "dall-e-3",
                n: 1,
                size: "1024x1024",
                response_format: "url"
            });
            const imageBuffer = await (await (0, node_fetch_1.default)(response?.data?.[0].url ?? '')).arrayBuffer();
            await interaction.editReply({
                content: `Daar gaat weer 4 cent van Joop... \nPrompt is ${prompt}. `,
                files: [{ attachment: Buffer.from(imageBuffer), name: "image.png" }]
            });
        }
        catch (error) {
            console.error(error);
            await interaction.editReply({ content: `Oh nee een error. \nPrompt was ${prompt}. \n${error?.error?.message}` });
        }
    }
}
exports.default = Imagine;
