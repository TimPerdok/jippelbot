import readline from "readline";
import {exec} from 'child_process'

export default class StdinListener {

    constructor() {}

    start() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.on('line', (line) => {
            exec(line, (error, stdout, stderr) => {
                if (error) return console.error(error);
                if (stderr) return console.error(stderr);
                console.log(`stdout: ${stdout}`);
            });
        });
    }

}
