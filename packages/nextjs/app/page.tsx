"use client";

import { useEffect, useState } from "react";
import { providers } from "ethers";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MonitoringAndSafe } from "~~/components/monitor-safe";
import { Address } from "~~/components/scaffold-eth";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    let provider: providers.JsonRpcProvider | null = null;

    if (isMonitoring && connectedAddress) {
      provider = new providers.JsonRpcProvider(RPC_URL);

      provider.on("block", async blockNumber => {
        console.log(`[BLOCK ${blockNumber}]`);
        setBlockNumber(blockNumber);
      });
    }

    // Cleanup the listener when component unmounts or isMonitoring changes
    return () => {
      if (provider) {
        provider.removeAllListeners("block");
      }
    };
  }, [isMonitoring, connectedAddress]);

  const handleClick = () => {
    setIsMonitoring(!isMonitoring);
    console.log(`Monitoring started...`);
  };

  return (
    <>
      <div className="flex flex-col items-center flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Monitoring Wallet Balance</span>
          </h1>
          <div className="flex flex-col items-center justify-center space-x-2 sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <button onClick={handleClick} className="btn btn-outline">
          Start Monitoring & Recovering
        </button>
        <div>Status: {isMonitoring ? "Active" : "Inactive"}</div>

        {isMonitoring && connectedAddress && (
          <div>
            <MonitoringAndSafe />
            {blockNumber && <p>Current Block: {blockNumber}</p>}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
