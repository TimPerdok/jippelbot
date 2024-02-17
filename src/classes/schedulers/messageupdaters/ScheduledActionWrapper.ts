import lzString from "lz-string";
import MessageUpdater from "./MessageUpdater";
import ReactiveList from "../../monads/ReactiveList";
import Scheduler, { Interval } from "../../Scheduler";
import { Message, MessageEditOptions, MessagePayload } from "discord.js";


export  type Schedule = {
    callback: () => any;
    at: Date | Interval;
}

export default class ScheduledAction {
    protected scheduler: Scheduler;
    protected schedule: Schedule;

    constructor(schedule: Schedule) {
        this.scheduler = new Scheduler();
        this.schedule = schedule
        this.scheduler.schedule(this.schedule);
    }

    
    async stop() {
        await this.scheduler.stop()
    }

    refresh() {
        this.scheduler.stop()
        this.schedule.callback()
        this.scheduler.schedule(this.schedule);
    }

}
