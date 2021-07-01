import {
  CLUSTER_SLUGS,
  ENV,
  TokenListProvider,
} from "@solana/spl-token-registry";
import { mkdir, stat } from "fs/promises";
import * as fs from "fs";
import { IncomingMessage } from "http";
import * as https from "https";
import * as http from "http";
import pLimit from "p-limit";
import { URL } from "url";
import { extname } from "path";

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
        if ((await stat(path)).isFile()) {
          console.warn(`Skipping ${token.name}`);
          return;
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
