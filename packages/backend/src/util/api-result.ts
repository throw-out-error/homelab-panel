import { ProcessResult } from "@throw-out-error/pm";
export class ApiResult implements ProcessResult {
    status: boolean;
    error?: Error;
}
