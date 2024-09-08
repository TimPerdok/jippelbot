"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../classes/Command"));
class Wanneerbenikgejoined extends Command_1.default {
    constructor() {
        super("wanneerbenikgejoined", "wanneer je wilt weten wanneer je bent gejoined");
    }
    async onCommand(interaction) {
        return await interaction.reply({ content: `Jij bent gejoined op ${interaction.member.joinedAt}.`, ephemeral: true });
    }
}
exports.default = Wanneerbenikgejoined;
