import * as chains from "viem/chains";

export const virtual_zetachain = {
  id: 77777,
  name: "Virtual Mode",
  network: "virtual_mainnet",
  nativeCurrency: { name: "vETH", symbol: "vETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://virtual.mode.rpc.tenderly.co/382393ee-e224-444c-8f00-d588a1e94c80"] },
    public: { http: ["https://virtual.mode.rpc.tenderly.co/382393ee-e224-444c-8f00-d588a1e94c80"] },
  },
  blockExplorers: {
    default: {
      name: "Tenderly Explorer",
      url: "https://virtual.mode.rpc.tenderly.co/bd73c153-6121-46fb-a1ef-949d23510403",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 2465882,
    },
  },
} as const satisfies chains.Chain;
