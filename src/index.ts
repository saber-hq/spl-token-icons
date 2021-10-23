import type { TokenInfo } from "@solana/spl-token-registry";
import icons from "./icons.json";

export const PREFIX =
  "https://spl-token-icons.static-assets.ship.capital/icons";

export const getTokenIcon = (
  info: Pick<TokenInfo, "address" | "chainId">
): string | null => {
  const { address, chainId } = info;
  const iconsMap: Record<string, Record<string, string>> = icons;
  const chainMap = iconsMap[chainId.toString()];
  if (chainMap && address in chainMap) {
    return `${PREFIX}/${chainId}/${address}${chainMap[address]}`;
  }
  return null;
};
