import { coreBlocks } from "./coreBlocks";

export function getCoreBlocks() {
  return coreBlocks;
}

export function getCoreBlockById(coreId) {
  return coreBlocks.find((coreBlock) => coreBlock.id === coreId) ?? null;
}
