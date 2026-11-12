import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { ApiError } from "../utils/ApiError";

/** Retry only aborted write conflicts; never retry an ambiguous commit. */
export async function withTransactionRetry<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await prisma.$transaction(operation, { maxWait: 5000, timeout: 10000 });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034") throw error;
      if (attempt === 3) throw new ApiError(409, "Stock is being updated. Please try placing your order again.");
      await new Promise(resolve => setTimeout(resolve, 30 * (attempt + 1) + Math.random() * 30));
    }
  }
  throw new ApiError(409, "Please try placing your order again.");
}
