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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = void 0;
const node_schedule_1 = require("node-schedule");
var Interval;
(function (Interval) {
    Interval["HOURLY"] = "0 * * * *";
    Interval["DAILY"] = "0 0 * * *";
    Interval["WEEKLY"] = "0 0 * * 0";
    Interval["MONTHLY"] = "0 0 1 * *";
    Interval["YEARLY"] = "0 0 1 1 *";
})(Interval = exports.Interval || (exports.Interval = {}));
class Scheduler {
    constructor(actions, name = "Scheduler") {
        this.actions = actions;
        this.name = name;
        this.init();
    }
    init() {
        const jobs = this.actions.map(({ callback, rule }, i) => (0, node_schedule_1.scheduleJob)(rule instanceof Date && rule < new Date() ? new Date() : rule, this.wrap(i, callback)));
        console.log(`Scheduled ${jobs.length} jobs for ${this.name}`);
    }
    wrap(index, callback) {
        return (fireDate) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Running job ${index} for ${this.name} at ${fireDate}`);
            try {
                yield this.remove(index);
                yield callback(fireDate);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    remove(index) {
        return __awaiter(this, void 0, void 0, function* () {
            this.actions.splice(index, 1);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, node_schedule_1.gracefulShutdown)();
        });
    }
    reschedule() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stop();
            this.init();
        });
    }
    add(action) {
        return __awaiter(this, void 0, void 0, function* () {
            this.actions.push(action);
            yield this.reschedule();
        });
    }
}
exports.default = Scheduler;
