import React, { useEffect, useState } from "react";
import { gasPriceToGwei } from "./converter.lib";
import { Wallet, providers, utils } from "ethers";

const { formatEther } = utils;

const SAFE_WALLET = process.env.NEXT_PUBLIC_SAFE_WALLET as string;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;
const COMPROMISED_PRIVATE_KEY = process.env.NEXT_PUBLIC_COMPROMISED_PRIVATE_KEY as string;
const thresholdToTransfer = "0.01";
const gasLimit = 21000;

if (!SAFE_WALLET || !RPC_URL) {
  throw new Error("SAFE_WALLET and RPC_URL must be set in the environment variables.");
}

const provider = new providers.JsonRpcProvider(RPC_URL);

export const MonitoringAndSafe = () => {
  const burnWallet = new Wallet(COMPROMISED_PRIVATE_KEY, provider);
  const [balance, setBalance] = useState<string | null>(null);
  const [safeBalance, setSafeBalance] = useState<string | null>(null);

  useEffect(() => {
    const monitorBalance = async () => {
      try {
        const threshold = utils.parseEther(thresholdToTransfer);
        const walletBalance = await burnWallet.getBalance();

        if (walletBalance.isZero()) {
          console.log("Balance is zero");
          setBalance(formatEther(walletBalance));
          return;
        }

        const gasPrice = await provider.getGasPrice();
        const gasCost = gasPrice.mul(gasLimit).mul(12).div(10);

        if (walletBalance.lt(gasCost)) {
          console.log(
            `Insufficient funds for gas (balance=${formatEther(
              walletBalance,
            )} ETH, gasCost=${formatEther(gasCost)} ETH)`,
          );
          setBalance(formatEther(walletBalance));
          return;
        }

        if (walletBalance.gt(threshold)) {
          const safeValue = walletBalance.sub(gasCost);
          console.log(`safeValue: ${formatEther(safeValue)} ETH`);

          try {
            const nonce = await provider.getTransactionCount(burnWallet.address, "latest");
            const tx = await burnWallet.sendTransaction({
              to: SAFE_WALLET,
              gasLimit,
              gasPrice,
              nonce,
              value: safeValue,
            });

            console.log(
              `Sent tx with nonce ${tx.nonce} burning ${formatEther(
                walletBalance,
              )} ETH at gas price ${gasPriceToGwei(gasPrice)}`,
            );

            const safeWalletBalance = await provider.getBalance(SAFE_WALLET);
            setSafeBalance(formatEther(safeWalletBalance));
          } catch (err: any) {
            console.log(`Error sending tx: ${err.message ?? err}`);
          }
        } else {
          console.log(`Balance is below threshold: ${formatEther(walletBalance)} ETH`);
        }

        setBalance(formatEther(walletBalance));
      } catch (error) {
        console.error("Error in monitoringAndSafe function:", error);
      }
    };

    monitorBalance();
  }, [burnWallet]);

  return (
    <div>
      <p>
        <h2>Monitoring Wallet Balance</h2>

        <code className="inline-block max-w-full text-base italic font-bold break-words break-all bg-base-300">
          {balance ?? 0} ETH
        </code>
      </p>
      <p>
        <h2>Safe Wallet Balance: </h2>
        <code className="inline-block max-w-full text-base italic font-bold break-words break-all bg-base-300">
          {safeBalance ?? 0} ETH
        </code>
      </p>
    </div>
  );
};
