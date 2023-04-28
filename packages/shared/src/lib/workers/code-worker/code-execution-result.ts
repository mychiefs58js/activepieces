
export interface CodeExecutionResult {
    verdict: CodeRunStatus,
    timeInSeconds: number,
    standardOutput: string
    standardError: string,
    output: unknown,
}

export enum CodeRunStatus {
    OK = "OK",
    RUNTIME_ERROR = "RUNTIME_ERROR",
    CRASHED = "CRASHED",
    TIMEOUT = "TIMEOUT",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}