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
        return () => __awaiter(this, void 0, void 0, function* () {
            const newPoll = yield Bot_1.default.getInstance().dataHandlers.poll.getItem(this.guild.id, id);
            if (!newPoll)
                return;
            Poll_1.default.fromJson(newPoll).finish();
        });
    }
    addPoll(poll) {
        this.actions.push({
            rule: poll.hasPassed ? new Date() : new Date((poll.endDate * 1000)),
            callback: this.createCallback(poll.id),
        });
        this.reload();
    }
    reload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scheduler.stop();
            this.init();
        });
    }
}
exports.default = VoteManager;
