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
const ScheduledActionWrapper_1 = __importDefault(require("./ScheduledActionWrapper"));
const Poll_1 = __importDefault(require("../data/polls/Poll"));
class VoteScheduler {
    constructor(guild) {
        this.guild = guild;
        this.scheduledActions = this.createScheduledActions();
    }
    createScheduledActions() {
        const polls = Bot_1.default.getInstance().dataHandlers.poll.getAllOfServer(this.guild.id).map((poll) => Poll_1.default.fromItem(poll));
        return polls.map((poll) => new ScheduledActionWrapper_1.default({
            callback: () => __awaiter(this, void 0, void 0, function* () {
                const newPoll = yield Bot_1.default.getInstance().dataHandlers.poll.getItem(this.guild.id, poll.id);
                if (!newPoll)
                    return;
                Poll_1.default.fromItem(newPoll).finish();
            }),
            at: poll.hasPassed ? new Date() : new Date((poll.endDate * 1000))
        }));
    }
    addPoll(poll) {
        this.scheduledActions.push(new ScheduledActionWrapper_1.default({
            callback: () => __awaiter(this, void 0, void 0, function* () {
                const newPoll = yield Bot_1.default.getInstance().dataHandlers.poll.getItem(this.guild.id, poll.id);
                if (!newPoll)
                    return;
                Poll_1.default.fromItem(newPoll).finish();
            }),
            at: poll.hasPassed ? new Date() : new Date((poll.endDate * 1000))
        }));
    }
    reschedule() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this.scheduledActions.map((action) => action.stop()));
            this.scheduledActions = this.createScheduledActions();
        });
    }
}
exports.default = VoteScheduler;
