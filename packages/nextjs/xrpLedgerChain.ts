import { defineChain } from "viem";

export const xrpledgerChain = /*#__PURE__*/ defineChain({
  id: 1440002,
  name: "XRP EVM DEVNET LEDGER",
  network: "xrpledger",
  nativeCurrency: {
    decimals: 18,
    name: "XRP EVM DEVNET LEDGER",
    symbol: "eXRP",
  },
  rpcUrls: {
    default: { http: ["https://rpc-evm-sidechain.xrpl.org"] },
    public: { http: ["https://rpc-evm-sidechain.xrpl.org"] },
  },
});
