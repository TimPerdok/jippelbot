import lzString from "lz-string";
import MessageUpdater from "./MessageUpdater";
import ReactiveList from "../ReactiveList";
import Scheduler, { Interval } from "../Scheduler";
import { Message, MessageEditOptions, MessagePayload } from "discord.js";


export  type Schedule = {
    callback: () => any;
    at: Date | Interval;
}

export default abstract class ScheduledActionWrapper {
    protected scheduler: Scheduler;
    protected schedule: Schedule;

    constructor(interval: Date | Interval) {
        this.scheduler = new Scheduler();
        this.schedule = {
            callback: this.run.bind(this),
            at: interval
        }
        this.scheduler.schedule(this.schedule);
    }

    
    stop() {
        this.scheduler.stop()
    }

    refresh() {
        this.scheduler.stop()
        this.run()
        this.scheduler.schedule(this.schedule);
    }

    abstract run(): any | Promise<any>;

}
