import { gracefulShutdown, JobCallback, RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit, scheduleJob } from "node-schedule";

export type ScheduledAction = {
    callback: JobCallback
    rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number
}

export enum Interval {
    HOURLY = "0 * * * *",
    DAILY = "0 0 * * *",
    WEEKLY = "0 0 * * 0",
    MONTHLY = "0 0 1 * *",
    YEARLY = "0 0 1 1 *"
}

export default class Scheduler {

    constructor(private actions: ScheduledAction[], private name: string = "Scheduler") {
        this.init();
    }

    private init() {
        const jobs = this.actions.map(({ callback, rule }, i) =>
            scheduleJob(
                rule instanceof Date && rule < new Date() ? new Date() : rule,
                this.wrap(i, callback)));
        console.log(`Scheduled ${jobs.length} jobs for ${this.name}`);
    }

    private wrap(index: number, callback: JobCallback): JobCallback {
        return async (fireDate: Date) => {
            try {
                await this.remove(index);
                await callback(fireDate);
            } catch (error) {
                console.error(error);
            }
        }
    }

    private async remove(index: number) {
        this.actions.splice(index, 1);
    }

    async stop() {
        await gracefulShutdown();
    }

    private async reschedule() {
        await this.stop();
        this.init();
    }

    async add(action: ScheduledAction) {
        this.actions.push(action);
        await this.reschedule();
    }

}
