import { ButtonInteraction, ChatInputCommandInteraction, Client, Collection, DiscordAPIError, GuildChannelManager, Interaction, InteractionResponse, parseWebhookURL, SlashCommandBuilder, TextChannel } from "discord.js";
import Command from "../classes/Command";
import Poll from "../classes/Poll";
import Classfinder from "../classes/Classfinder";
import Subcommand from "../classes/Subcommand";
import JSONDataHandler from "../classes/datahandlers/JSONDataHandler";
import { PollJSON } from "../types/PollJSON";
import { openai } from '../index'
import fetch from 'node-fetch';
import DiscordBot from "../classes/Bot";
import { ServerConfig } from "../types/ServerdataJSON";

export default class Summon extends Command {


    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("prompt").setDescription("De prompt voor de afbeelding").setRequired(true))
        return builder as SlashCommandBuilder;
    }

    constructor() {
        super("imagine", "Imagine een afbeelding");

    }


    async onCommand(interaction: ChatInputCommandInteraction) {
        const serverdata = await DiscordBot.getInstance().dataHandlers.serverdata.getOfServer(interaction.guildId ?? "") as ServerConfig;
        if (!serverdata.isDalleEnabled) return interaction.reply({ content: "Dall-e is niet enabled op deze server", ephemeral: true });

        const prompt = interaction.options.getString("prompt", true);
        interaction.deferReply();

        try {
            const response = await openai.images.generate({
                prompt,
                model: "dall-e-3",
                n: 1,
                size: "1024x1024",
                response_format: "url"
            });
            const imageBuffer = await (await fetch(response?.data?.[0].url ?? '')).arrayBuffer();
            await interaction.editReply({
                content: `Daar gaat weer 4 cent van Joop... \nPrompt is ${prompt}. `,
                files: [{ attachment:  Buffer.from(imageBuffer), name: "image.png" }]
            });
        } catch (error: any) {
            console.error(error);
            
            await interaction.editReply({ content: `Oh nee een error. \nPrompt was ${prompt}. \n${error?.error?.message}` });
        }


    }










}
