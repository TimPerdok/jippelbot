import lzString from "lz-string";
import MessageUpdater from "./MessageUpdater";
import ReactiveList from "../ReactiveList";
import Scheduler, { Interval } from "../Scheduler";


export  type Schedule = {
    callback: () => any;
    at: Date | Interval;
}

export default class ScheduledMessageUpdater extends MessageUpdater {
    protected schedules: ReactiveList<Schedule>;
    protected scheduler: Scheduler;

    constructor() {
        super()
        this.scheduler = new Scheduler();
        this.schedules = new ReactiveList<Schedule>(this.reschedule.bind(this));
    }
    
    addSchedule(schedule: Schedule) {
        this.schedules.push(schedule);
    }

    addSchedules(schedules: Schedule[]) {
        this.schedules.push(...schedules);
    }

    reschedule() {
        this.scheduler.refresh();
        this.scheduler.schedule(this.schedules);
    }

}
