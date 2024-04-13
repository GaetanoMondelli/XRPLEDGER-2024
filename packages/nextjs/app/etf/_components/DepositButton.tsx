import React from "react";
import { useAccount, useContractWrite } from "wagmi";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

const xrpledgerchainId = 1440002;

export function DepositButton({
  bundleId,
  tokenAddressA,
  quantityTokenA,
  tokenAddressB,
  quantityTokenB,
}: {
  bundleId: string;
  tokenAddressA: any;
  quantityTokenA: any;
  tokenAddressB: any;
  quantityTokenB: any;
}) {
  const contractsData = getAllContracts();
  const { address: connectedAddress } = useAccount();

  const contractName = "ETFIssuingChain";
  const {
    data: deposit,
    isLoading: isdepLoading,
    writeAsync: depositAsync,
  } = useContractWrite({
    address: contractsData[contractName].address,
    functionName: "deposit",
    abi: contractsData[contractName].abi,
    args: [
      {
        vaultId: bundleId,
        tokens: [
          {
            _address: tokenAddressA,
            _quantity: quantityTokenA,
            _chainId: xrpledgerchainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
          {
            _address: tokenAddressB,
            _quantity: quantityTokenB,
            _chainId: xrpledgerchainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
        ],
      },
    ],
  });

  return (
    <button
      className="bg-green-500 hover:bg-green-700 text-white size font-bold py-2 px-6 rounded-full"
      style={{ 
        marginLeft: "4%",
        marginRight: "4%",
        cursor: "pointer", fontSize: "18px" }}
      onClick={async () => {
        await depositAsync();
      }}
      disabled={isdepLoading}
    >
      Deposit
    </button>
  );
}
