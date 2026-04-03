type LogType = "info" | "error" | "success";

interface LogEntry {
    message: string;
    type: LogType;
}


export class StatusStore {

    status: string[] = $state([]);
    private logger: LogEntry[] = $state([]);

    addStatusMsg(message: string, type: LogType = "info") {
        this.status.push(message);
        return message;
    }

    clearStatus() {
        this.status = [];
    }

    getStatus() {
        return this.status;
    }
}

export const statusStore = new StatusStore();