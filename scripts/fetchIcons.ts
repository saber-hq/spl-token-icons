import { ENV, Strategy, TokenListProvider } from "@solana/spl-token-registry";
import { mkdir, stat, writeFile } from "fs/promises";
import { createWriteStream } from "fs";
import { IncomingMessage } from "http";
import { https, http } from "follow-redirects";
import pLimit from "p-limit";
import { URL } from "url";
import { extname } from "path";
import invariant from "tiny-invariant";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const limit = pLimit(10);

/**
 * @param forceUpdate Forces an update of token icons.
 */
const main = async (forceUpdate: boolean = false) => {
  const tokens = await new TokenListProvider().resolve(Strategy.GitHub);
  const tokenList = tokens.getList();

  await Promise.all(
    [ENV.MainnetBeta, ENV.Testnet, ENV.Devnet].map((env) =>
      mkdir(`${__dirname}/../icons/${env}/`, { recursive: true })
    )
  );

  const iconMap: { [id: number]: Record<string, string> } = {
    [ENV.MainnetBeta]: {},
    [ENV.Testnet]: {},
    [ENV.Devnet]: {},
  };

  await Promise.all(
    tokenList.map(async (token) => {
      await limit(async () => {
        if (!token.logoURI) {
          return;
        }
        const url = new URL(token.logoURI);

        // Image will be stored at this path
        const extension = extname(url.pathname);
        const path = `${__dirname}/../icons/${token.chainId}/${token.address}${extension}`;
        const chainMap = iconMap[token.chainId];
        invariant(chainMap, `chain ${token.chainId} invalid`);
        chainMap[token.address] = extension;

        if (!forceUpdate) {
          try {
            await stat(path);
            return;
          } catch (e) {
            if (!(e instanceof Error && e.message.includes("ENOENT"))) {
              throw e;
            }
          }
        }

        const handleFile = (res: IncomingMessage) => {
          console.log(`Downloading ${token.name}`);
          const filePath = createWriteStream(path);
          res.pipe(filePath);
          filePath.on("finish", () => {
            filePath.close();
            console.log(`Downloaded icon for ${token.name} (${token.address})`);
          });
        };

        const onError = (err: Error) => {
          console.warn(
            `Error fetching icon for ${token.name} (${token.address}) at ${token.logoURI}:`
          );
          console.warn(err);
        };

        if (url.protocol === "http:") {
          http.get(token.logoURI, handleFile).on("error", onError);
        } else {
          https.get(token.logoURI, handleFile).on("error", onError);
        }
      });
    })
  );

  await writeFile(
    `${__dirname}/../src/icons.json`,
    JSON.stringify(iconMap),
    {}
  );
};

main(process.env.FORCE_UPDATE === "true").catch((e) => console.error(e));
