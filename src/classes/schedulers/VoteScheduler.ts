import DiscordBot from "../Bot";
import { Guild } from "discord.js";
import Poll from "../data/polls/Poll";
import { VoteAction } from "../data/VoteActions";
import { PollJSON } from "../../types/PollJSON";
import Scheduler, { ScheduledAction } from "../Scheduler";


export default class VoteManager  {
    

    private scheduler: Scheduler;

    private actions: ScheduledAction[]
   
    constructor(private guild: Guild) {
        this.actions = this.createScheduledActions();
        this.init();
    }

    init() {
        this.scheduler = new Scheduler(this.actions, "VoteScheduler");
    }

    createScheduledActions() {
        const polls = DiscordBot.getInstance().dataHandlers.poll.getAllOfServer(this.guild.id).map((poll) => Poll.fromJson(poll))
        return polls.map((poll) => {
            return ({
                callback: this.createCallback(poll.id),
                rule: poll.hasPassed || poll.expired ? new Date() : new Date((poll.endDate * 1000))
            })
        })
    }

    createCallback(id: string): any {
        return async () => {
            const newPoll = await DiscordBot.getInstance().dataHandlers.poll.getItem(this.guild.id, id) as PollJSON<VoteAction>
            if (!newPoll) return
            Poll.fromJson(newPoll).finish()
        }
    }

    addPoll(poll: Poll<VoteAction>) {
        this.actions.push({
            rule: poll.hasPassed ? new Date() : new Date((poll.endDate * 1000)),
            callback: this.createCallback(poll.id),
        })
        this.reload()
    }

    async reload() {
        await this.scheduler.stop()
        this.init()
    }

}


