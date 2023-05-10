"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Classfinder_1 = __importDefault(require("./Classfinder"));
class Command {
    get data() {
        return new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
    constructor(name, description) {
        this.name = name.toLowerCase();
        this.description = description;
        this.subcommands = new Map();
        Classfinder_1.default.getSubcommands(this.name).then((subcommands) => {
            subcommands.forEach((subcommand) => {
                this.subcommands.set(subcommand.name, subcommand);
            });
        });
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
