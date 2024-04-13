import React, { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { displayTxResult } from "~~/app/debug/_components/contract";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

interface TokenBalanceAllowanceProps {
  name: string;
  tokenAddress: string;
}

const TokenBalanceAllowance: React.FC<TokenBalanceAllowanceProps> = ({ name, tokenAddress }) => {
  const [balance, setBalance] = useState<any>();
  const [allowance, setAllowance] = useState<any>();
  const { address: connectedAddress } = useAccount();
  const contractsData = getAllContracts();

  const { isFetching: isFet, refetch: fetchBalance } = useContractRead({
    address: tokenAddress,
    functionName: "balanceOf",
    abi: contractsData["SimpleERC20"].abi,
    args: [connectedAddress],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
  });

  const { isFetching: isFetAllow, refetch: fetchAllowance } = useContractRead({
    address: tokenAddress,
    functionName: "allowance",
    abi: contractsData["SimpleERC20"].abi,
    args: [connectedAddress, contractsData["ETFIssuingChain"].address],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
  });

  useEffect(() => {
    async function fetchData() {
      if (isFet || !connectedAddress) {
        return;
      }
      if (fetchBalance) {
        const { data } = await fetchBalance();
        setBalance(data);
      }
    }
    fetchData();
  }, [connectedAddress]);

  useEffect(() => {
    async function fetchData() {
      if (isFetAllow || !connectedAddress) {
        return;
      }
      if (fetchAllowance) {
        const { data } = await fetchAllowance();
        console.log("allowance", connectedAddress, contractsData["ETFIssuingChain"].address, data);
        setAllowance(data);
      }
    }
    fetchData();
  }, [connectedAddress]);

  return (
    <div>
      <b>{name} Token Balance</b>
      {displayTxResult(balance)}
      {"  "}
      <span>(Allowance {displayTxResult(allowance)} )</span>
      <br></br>
    </div>
  );
};

export default TokenBalanceAllowance;
