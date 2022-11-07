import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import {ClientI} from "./Client";
import Command from "./Command";




export default class DiscordBot {

    rest : REST;



    client: Client;

    constructor(token: string, commands: Collection<string, Command>) {
        this.rest = new REST({ version: '10' }).setToken(token);
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client?.user?.tag}!`);
        });


        // @ts-ignore
        this.client.commands = commands;


        this.client.on(Events.InteractionCreate, async (interaction: any) => {
            if (!interaction.isChatInputCommand()) return;
            const client = interaction.client as ClientI;
            const command = client.commands.get(interaction.commandName);
            if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
                
            
        
            try {
                await command.execute(interaction);
            } catch (error) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
       

        this.client.login(token);
    }
   
    
   


}
