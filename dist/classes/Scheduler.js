"use strict";
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
})(Interval || (exports.Interval = Interval = {}));
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
        return async (fireDate) => {
            console.log(`Running job ${index} for ${this.name} at ${fireDate}`);
            try {
                await this.remove(index);
                await callback(fireDate);
            }
            catch (error) {
                console.error(error);
            }
        };
    }
    async remove(index) {
        this.actions.splice(index, 1);
    }
    async stop() {
        await (0, node_schedule_1.gracefulShutdown)();
    }
    async reschedule() {
        await this.stop();
        this.init();
    }
    async add(action) {
        this.actions.push(action);
        await this.reschedule();
    }
}
exports.default = Scheduler;
