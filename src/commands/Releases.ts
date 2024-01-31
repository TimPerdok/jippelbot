import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import Command from "../classes/Command";
import DataHandler from "../classes/datahandlers/DataHandler";
import IGDBApi from "../api/IGDBApi";

export default class Subscribe extends Command {

    get data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
    }

    constructor() {
        super("releases", "Laat de toegevoegde upcoming game releases zien")
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        try {
            let games = await DataHandler.getGameSubscriptions(interaction.guildId ?? "");
            games = games?.sort((a, b) => {
                if (!a.nextReleaseDate && !b.nextReleaseDate) return 0;
                if (!a.nextReleaseDate) return 1;
                if (!b.nextReleaseDate) return -1
                return a.nextReleaseDate - b.nextReleaseDate;
            });
            if (!games?.length) return await interaction.reply("Er zijn nog geen games toegevoegd.");
            const embed = {
                title: "Upcoming game releases",
                fields: games.map((game, index) => {
                    const date = new Date((game?.nextReleaseDate ?? 0) * 1000);
                    const status = game?.currentReleaseStatus != undefined
                                    ? `(${IGDBApi.statusToString(game.currentReleaseStatus ?? 0)})`
                                    : "";
                    return {
                        name: `${++index}. ${game.name} ${status}`,
                        value: game.nextReleaseDate ?
                            `${IGDBApi.statusToString(game?.nextReleaseStatus ?? 0)} op <t:${Math.round(date.getTime() / 1000)}>
                            <t:${Math.round(date.getTime() / 1000)}:R>`
                            : "Geen datum bekend",
                        inline: true
                    }
                }).slice(0, 25)
            };
            await interaction.reply({ embeds: [embed] });    
        } catch (error) {
            interaction.reply(`Er is iets fout gegaan. ${error}`);
        }
        
    }

}
