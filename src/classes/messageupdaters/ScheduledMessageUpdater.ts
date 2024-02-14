import lzString from "lz-string";
import MessageUpdater from "./MessageUpdater";
import ReactiveList from "../ReactiveList";
import Scheduler, { Interval } from "../Scheduler";
import { Message, MessageEditOptions, MessagePayload } from "discord.js";
import ScheduledActionWrapper from "./ScheduledMessageUpdaterAbstr";


export type Schedule = {
    callback: () => any;
    at: Date | Interval;
}

export default class ScheduledAction extends ScheduledActionWrapper {
    
    constructor(schedule: Schedule) {
        super(schedule.at);
    }

    run() {
        return this.schedule.callback();
    }



}
