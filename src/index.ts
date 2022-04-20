import type { TokenInfo } from "@solana/spl-token-registry";
import icons from "./icons.json";

export const PREFIX_OLD =
  "https://spl-token-icons.static-assets.ship.capital/icons";

export const PREFIX = `https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons`;

const iconsMap: Record<string, Record<string, string>> = icons;

export const getTokenIcon = (
  info: Pick<TokenInfo, "address" | "chainId">
): string | null => {
  const { address, chainId } = info;
  const chainMap = iconsMap[chainId.toString()];
  if (chainMap && address in chainMap) {
    return `${PREFIX}/${chainId}/${address}${chainMap[address]}`;
  }
  return null;
};
