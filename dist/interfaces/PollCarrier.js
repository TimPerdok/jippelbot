"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataHandler_1 = __importDefault(require("../classes/datahandlers/DataHandler"));
const Subcommand_1 = __importDefault(require("../classes/Subcommand"));
class PollSubcommand extends Subcommand_1.default {
    constructor(name, description, parentCommand) {
        super(name, description, parentCommand);
        this.polls = new Map();
        DataHandler_1.default.getPolls(this).then((polls) => {
            this.polls = polls;
        });
    }
    onCommand(interaction) {
        throw new Error("Method not implemented.");
    }
    onButtonPress(interaction) {
        throw new Error("Method not implemented.");
    }
}
exports.default = PollSubcommand;
