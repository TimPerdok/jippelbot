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
const Scheduler_1 = __importDefault(require("../../Scheduler"));
class ScheduledAction {
    constructor(schedule) {
        this.scheduler = new Scheduler_1.default();
        this.schedule = schedule;
        this.scheduler.schedule(this.schedule);
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.scheduler.stop();
        });
    }
    refresh() {
        this.scheduler.stop();
        this.schedule.callback();
        this.scheduler.schedule(this.schedule);
    }
}
exports.default = ScheduledAction;
