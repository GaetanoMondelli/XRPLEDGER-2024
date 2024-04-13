// import { DebugContracts } from "./_components/DebugContracts";
"use client";

import { useEffect, useState } from "react";
import { MatrixView } from "./_components/MatrixView";
import "./index.css";
import type { NextPage } from "next";
import { useContractRead } from "wagmi";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

const ETF: NextPage = () => {
  const contractsData = getAllContracts();
  const [bundleId, setBundleId] = useState<string>("1");
  const [bundles, setBundles] = useState<any>();
  const [vault, setVault] = useState<any>({});
  const [tokens, setTokens] = useState<any>();
  // const [resultFee, setResultFee] = useState<any>();
  // const [txValue, setTxValue] = useState<string | bigint>("");


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

  // const etfTokenAddress = "0xEbC26af07cbbE8E87b8Fe3A1F5ac02950D3Fa2A8";


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
        </div>
        {/* {JSON.stringify(vault)} */}
        <br></br>


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
        <br></br>
        {/* <CollateralVaultView bundleId={bundleId} /> */}
        <br></br>
      </div>
    </>
  );
};

export default ETF;
