// import { DebugContracts } from "./_components/DebugContracts";
"use client";

import { useEffect, useState } from "react";
import { TxReceipt, displayTxResult } from "../debug/_components/contract";
import { DepositController } from "./_components/DepositController";
import { MatrixView } from "./_components/MatrixView";
import PieToken from "./_components/PieToken";
import TokenBalanceAllowance from "./_components/tokenBalanceAllowance";
import "./index.css";
import { BigNumber } from "@ethersproject/bignumber";
import type { NextPage } from "next";
import { TransactionReceipt } from "viem";
import { useAccount, useContractRead, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

// import { DebugContracts } from "./_components/DebugContracts";

// import { DebugContracts } from "./_components/DebugContracts";

// import { DebugContracts } from "./_components/DebugContracts";

const ETF: NextPage = () => {
  const contractsData = getAllContracts();
  const [bundleId, setBundleId] = useState<string>("1");
  const [bundles, setBundles] = useState<any>();
  const [vault, setVault] = useState<any>({});
  const [tokens, setTokens] = useState<any>();
  // const [resultFee, setResultFee] = useState<any>();
  // const [txValue, setTxValue] = useState<string | bigint>("");
  const writeTxn = useTransactor();
  const { chain } = useNetwork();

  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;
  const { address: connectedAddress } = useAccount();

  const contractName = "ETFIssuingChain";

  const { isFetching: isFetToken, refetch: tokensFetch } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "getRequiredTokens",
    abi: contractsData[contractName].abi,
    args: [],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      console.log(parsedErrror);
    },
  });

  const { isFetching, refetch } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "getVaultStates",
    abi: contractsData[contractName].abi,
    args: [],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
  });

  const { isFetching: isVaultFet, refetch: vaultSate } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "getVault",
    abi: contractsData[contractName].abi,
    args: [bundleId],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
  });

  const etfTokenAddress = "0x00227316A62E8c4A4942231c2001E58a6dDeF408";

  const handleWrite = async () => {
    if (writeAsync) {
      try {
        const makeWriteWithParams = () => writeAsync({ value: BigInt(collateralAmountFee.toString()) });
        await writeTxn(makeWriteWithParams);
        // onChange();
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (isFetching) {
        return;
      }
      if (refetch) {
        const { data } = await refetch();
        setBundles(data);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (isVaultFet) {
        return;
      }
      if (vaultSate) {
        const { data } = await vaultSate();
        console.log("vault", data);
        setVault(data);
      }
    }
    fetchData();
  }, [bundleId]);

  useEffect(() => {
    async function fetchData() {
      if (isFetToken) {
        return;
      }
      if (tokensFetch) {
        const { data } = await tokensFetch();
        console.log("tokens", data);
        setTokens(data);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          color: "black",
          // centering the card
          margin: "auto",
          width: "1000px",
        }}
        className="card"
      >
        <h1 className="text-4xl my-0">ETF {bundleId}</h1>
        {/* <p>{displayTxResult(contractsData[contractName].address)}</p> */}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {bundles && <MatrixView setBundleId={setBundleId} bundleId={bundleId} bundles={bundles} />}
          {vault && vault._tokens && <PieToken input={vault}></PieToken>}
        </div>
        {/* {JSON.stringify(vault)} */}
        <br></br>
        <TokenBalanceAllowance name={"ETF"} tokenAddress={etfTokenAddress} />
        {tokens &&
          tokens.map((token: any, index: number) => {
            return <TokenBalanceAllowance key={index} name={index.toString()} tokenAddress={token._address} />;
          })}

        {/* <b>ETF Token Balance</b>
        {displayTxResult(balance)}
        <br></br> */}
        {/* <button className="btn btn-secondary btn-sm" disabled={writeDisabled || isLoading} onClick={handleWrite}>
          {isLoading && <span className="loading loading-spinner loading-xs"></span>}
          Send 💸
        </button>
        {txResult ? (
          <div className="flex-grow basis-0">
            {displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}
          </div>
        ) : null} */}
        <br></br>
        <br></br>
        <h1>Collateral Vault</h1>
        <p>Bundle ID: {bundleId}</p>
        <b>Required Tokens</b>
        <DepositController
          bundleId={bundleId}
          quantity={0}
          setQuantity={0}
          requiredQuantity={tokens && tokens[0] ? tokens[0]._quantity : 0}
          tokenAddress={tokens && tokens[0] ? tokens[0]._address : ""}
          chainId={tokens && tokens[0] ? tokens[0]._chainId : ""}
        />
        <DepositController
          bundleId={bundleId}
          quantity={0}
          setQuantity={0}
          requiredQuantity={tokens && tokens[1] ? tokens[1]._quantity : 0}
          tokenAddress={tokens && tokens[1] ? tokens[1]._address : ""}
          chainId={tokens && tokens[1] ? tokens[1]._chainId : ""}
        />
        <br></br>
        <br></br>
      </div>
    </>
  );
};

export default ETF;
