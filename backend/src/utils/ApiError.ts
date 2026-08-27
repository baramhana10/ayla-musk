export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const notFound = (resource = "Resource") => new ApiError(404, `${resource} not found`);
export const badRequest = (message: string) => new ApiError(400, message);
export const unauthorized = (message = "Authentication required") => new ApiError(401, message);
export const forbidden = (message = "You don't have permission to do that") => new ApiError(403, message);
export const conflict = (message: string) => new ApiError(409, message);
