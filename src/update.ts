import {
  CLUSTER_SLUGS,
  ENV,
  TokenListProvider,
} from "@solana/spl-token-registry";
import { mkdir, stat } from "fs/promises";
import * as fs from "fs";
import { IncomingMessage } from "http";
import { https, http } from "follow-redirects";
import pLimit from "p-limit";
import { URL } from "url";
import { extname } from "path";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const limit = pLimit(10);

const main = async () => {
  const tokens = await new TokenListProvider().resolve();
  const tokenList = tokens.getList();

  await Promise.all(
    [ENV.MainnetBeta, ENV.Testnet, ENV.Devnet].map((env) =>
      mkdir(`${__dirname}/../icons/${env}/`, { recursive: true })
    )
  );

  await Promise.all(
    tokenList.map(async (token) => {
      await limit(async () => {
        if (!token.logoURI) {
          return;
        }
        const url = new URL(token.logoURI);

        // Image will be stored at this path
        const path = `${__dirname}/../icons/${token.chainId}/${
          token.address
        }${extname(url.pathname)}`;
        try {
          await stat(path);
          // console.warn(`Skipping ${token.name}`);
          return;
        } catch (e) {
          if (!(e instanceof Error && e.message.includes("ENOENT"))) {
            throw e;
          }
        }

        const handleFile = (res: IncomingMessage) => {
          console.log(`Downloading ${token.name}`);
          const filePath = fs.createWriteStream(path);
          res.pipe(filePath);
          filePath.on("finish", () => {
            filePath.close();
            console.log("Download Completed");
          });
        };

        if (url.protocol === "http:") {
          http.get(token.logoURI, handleFile);
        } else {
          https.get(token.logoURI, handleFile);
        }
      });
    })
  );
};

main().catch((e) => console.error(e));
