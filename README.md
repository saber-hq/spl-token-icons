# spl-token-icons

Icons pre-downloaded to be able to be delivered efficiently via a GitHub CDN.

## Usage

```jsx
const parts = token.logoURI.split(".");
<img
  src={`https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/${
    token.chainId
  }/${token.address}.${parts[parts.length - 1] ?? ""}`}
/>;
```

## Updating

```bash
rm -r icons/
yarn add @solana/spl-token-registry
yarn icons:fetch
```

## License

Apache 2.0
