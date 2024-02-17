"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Command {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
    constructor(name, description, subcommands = []) {
        this.name = name.toLowerCase();
        this.description = description;
        this.subcommands = subcommands;
    }
    onCommand(interaction) { }
    onButtonPress(interaction) { }
    toJSON() {
        return JSON.stringify({
            name: this.name,
            description: this.description,
            execute: () => { }
        });
    }
}
exports.default = Command;
