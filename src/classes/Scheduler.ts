import {scheduleJob, gracefulShutdown} from "node-schedule"
import { Schedule } from "./messageupdaters/ScheduledMessageUpdaterAbstr";

export enum Interval {
    HOURLY = "0 * * * *",
    DAILY = "0 0 * * *",
    WEEKLY = "0 0 * * 0",
    MONTHLY = "0 0 1 * *",
    YEARLY = "0 0 1 1 *"
} 

export default class Scheduler {
    

    constructor() {
    }

    schedule(schedules: Schedule[] | Schedule) {
        if (!Array.isArray(schedules)) schedules = [schedules];
        schedules.forEach(({ callback, at }) => {
            scheduleJob(at, callback);
        })
    }

    stop() {
        gracefulShutdown();
    }

}
