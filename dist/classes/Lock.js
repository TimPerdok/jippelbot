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
exports.doWithLock = exports.waitFor = void 0;
/**
 * A wrapper around setTimeout which returns a promise. Useful for waiting for an amount of
 * time from an async function. e.g. await waitFor(1000);
 *
 * @param milliseconds The amount of time to wait.
 * @returns A promise that resolves once the given number of milliseconds has ellapsed.
 */
function waitFor(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}
exports.waitFor = waitFor;
/**
 * Used by doWithLock() to keep track of each "stack" of locks for a given lock name.
 */
const locksByName = {};
/**
 * Used to ensure that only a single task for the given lock name can be executed at once.
 * While JS is generally single threaded, this method can be useful when running asynchronous
 * tasks which may interact with external systems (HTTP API calls, React Native plugins, etc)
 * which will cause the main JS thread's event loop to become unblocked. By using the same
 * lock name for a group of tasks you can ensure the only one task will ever be in progress
 * at a given time.
 *
 * @param lockName The name of the lock to be obtained.
 * @param task The task to execute.
 * @returns The value returned by the task.
 */
function doWithLock(lockName, task) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure array present for the given lock name.
        if (!locksByName[lockName]) {
            locksByName[lockName] = [];
        }
        // Obtain the stack (array) of locks (promises) for the given lock name.
        // The lock at the bottom of the stack (index 0) is for the currently executing task.
        const locks = locksByName[lockName];
        // Determine if this is the first/only task for the given lock name.
        const isFirst = locks.length === 0;
        // Create the lock, which is simply a promise. Obtain the promise's resolve method which
        // we can use to "unlock" the lock, which signals to the next task in line that it can start.
        let unlock = () => { };
        const newLock = new Promise((resolve) => {
            unlock = resolve;
        });
        locks.push(newLock);
        // If this is the first task for a given lock, we can skip this. All other tasks need to wait
        // for the immediately proceeding task to finish executing before continuing.
        if (!isFirst) {
            const predecessorLock = locks[locks.length - 2];
            yield predecessorLock;
        }
        // Now that it's our turn, execute the task. We use a finally block here to ensure that we unlock
        // the lock so the next task can start, even if our task throws an error.
        try {
            return yield task();
        }
        catch (error) {
            throw error;
        }
        finally {
            // Ensure that our lock is removed from the stack.
            locks.splice(0, 1);
            // Invoke unlock to signal to the next waiting task to start.
            unlock();
        }
    });
}
exports.doWithLock = doWithLock;