"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Subcommand {
    constructor(name, description, parentCommand) {
        this.name = name;
        this.description = description;
        this.parentCommand = parentCommand;
    }
}
exports.default = Subcommand;
