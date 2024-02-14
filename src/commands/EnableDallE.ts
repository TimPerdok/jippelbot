import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import JSONDataHandler, { ServerScoped } from "../classes/datahandlers/JSONDataHandler";
import DiscordBot from "../classes/Bot";
import { ServerConfig } from "../types/ServerdataJSON";
import { DataJSON } from "../interfaces/MessageCarrier";


export default class Ping extends Command {

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addBooleanOption(option => option.setName("enabled").setDescription("Enable or disable dall-e").setRequired(true))
            .addStringOption(option => option.setName("password").setDescription("Pasword").setRequired(true)) as SlashCommandBuilder;
    }


    constructor() {
        super("enabledalle", "Enable or disable dall-e")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const enabled = interaction.options.getBoolean("enabled", true);
        const password = interaction.options.getString("password", true);
        if (password !== process.env.disablepass) return interaction.reply({ content: "Fout wachtwoord lmao", ephemeral: true })
        const serverdata = await DiscordBot.getInstance().dataHandlers.serverdata.getOfServer(interaction.guildId ?? "")
        serverdata.isDalleEnabled = enabled
        DiscordBot.getInstance().dataHandlers.serverdata.overwrite(interaction.guildId ?? "", serverdata)
        interaction.reply({ content: `Dall-e is now ${enabled ? "enabled" : "disabled"}`, ephemeral: true })
    }

}
