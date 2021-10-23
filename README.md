# spl-token-icons

Icons pre-downloaded to be able to be delivered efficiently via a GitHub CDN.

## Usage

```jsx
const parts = token.logoURI.split(".");
<img
  src={`https://spl-token-icons.static-assets.ship.capital/icons/${
    token.chainId
  }/${token.address}.${parts[parts.length - 1] ?? ""}`}
/>;
```

or

```
yarn add @saberhq/spl-token-icons
```

```jsx
import { getTokenInfo } from "@saberhq/spl-token-icons";

const icon = getTokenIcon({ address: "...", chainId: "..." });
```

## Updating

```bash
rm -r icons/
yarn add @solana/spl-token-registry
yarn icons:fetch
```

## License

Apache 2.0
