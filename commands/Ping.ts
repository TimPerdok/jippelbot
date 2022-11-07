import Command from "../classes/Command";


export default class Ping extends Command {


    constructor() {
        super("ping", "Pings someone")
    }


    
    async execute(interaction: any) {
        console.log(interaction)
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	}

}
