"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class ServerREST {
    constructor(rest, server, clientId) {
        this.rest = rest;
        this.server = server;
        this.clientId = clientId;
    }
    updateCommands(commands) {
        this.rest.put(discord_js_1.Routes.applicationGuildCommands(this.clientId, this.server.id), {
            body: [...commands.values()].map((command) => { return command.data.toJSON(); })
        });
    }
}
exports.default = ServerREST;
