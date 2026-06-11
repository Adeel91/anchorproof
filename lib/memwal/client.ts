import { MemWal } from "@mysten-incubation/memwal";

export const getMemWalClient = (namespace: string) => {
  if (!process.env.MEMWAL_DELEGATE_KEY || !process.env.MEMWAL_ACCOUNT_ID) {
    throw new Error("MemWal credentials not configured");
  }

  return MemWal.create({
    key: process.env.MEMWAL_DELEGATE_KEY,
    accountId: process.env.MEMWAL_ACCOUNT_ID,
    serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    namespace: namespace,
  });
};