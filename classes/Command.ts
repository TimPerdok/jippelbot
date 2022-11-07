import {  SlashCommandBuilder } from "discord.js";


export default abstract class Command {

    name: string
    description: string

    get data() {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
        return data
    }

    constructor(name: string, description: string) {
        this.name = name
        this.description = description
    }


    async execute(interaction: any) {
		
	}

}
