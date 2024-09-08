"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Bot_1 = __importDefault(require("../Bot"));
const Poll_1 = __importDefault(require("../data/polls/Poll"));
const Scheduler_1 = __importDefault(require("../Scheduler"));
class VoteManager {
    constructor(guild) {
        this.guild = guild;
        this.actions = this.createScheduledActions();
        this.init();
    }
    init() {
        this.scheduler = new Scheduler_1.default(this.actions, "VoteScheduler");
    }
    createScheduledActions() {
        const polls = Bot_1.default.getInstance().dataHandlers.poll.getAllOfServer(this.guild.id).map((poll) => Poll_1.default.fromJson(poll));
        return polls.map((poll) => {
            return ({
                callback: this.createCallback(poll.id),
                rule: poll.hasPassed || poll.expired ? new Date() : new Date((poll.endDate * 1000))
            });
        });
    }
    createCallback(id) {
        return async () => {
            const newPoll = await Bot_1.default.getInstance().dataHandlers.poll.getItem(this.guild.id, id);
            if (!newPoll)
                return;
            Poll_1.default.fromJson(newPoll).finish();
        };
    }
    addPoll(poll) {
        this.actions.push({
            rule: poll.hasPassed ? new Date() : new Date((poll.endDate * 1000)),
            callback: this.createCallback(poll.id),
        });
        this.reload();
    }
    async reload() {
        await this.scheduler.stop();
        this.init();
    }
}
exports.default = VoteManager;
