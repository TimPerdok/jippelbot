"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../classes/Command"));
const Addchannel_1 = __importDefault(require("./vote/Addchannel"));
const Removechannel_1 = __importDefault(require("./vote/Removechannel"));
const Renamechannel_1 = __importDefault(require("./vote/Renamechannel"));
const Kickplayer_1 = __importDefault(require("./vote/Kickplayer"));
class Vote extends Command_1.default {
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        this.subcommands.forEach((subcommand) => {
            builder.addSubcommand(subcommand.configure.bind(subcommand));
        });
        return builder;
    }
    constructor() {
        super("vote", "Start a vote", [
            new Addchannel_1.default(),
            new Removechannel_1.default(),
            new Renamechannel_1.default(),
            new Kickplayer_1.default(),
        ]);
    }
    onCommand(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const subcommand = this.subcommands.find(subcommand => subcommand.name === interaction.options.getSubcommand());
            if (subcommand)
                return subcommand.onCommand(interaction);
        });
    }
}
exports.default = Vote;
