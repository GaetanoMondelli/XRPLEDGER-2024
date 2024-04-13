"use client";

import React, { useEffect, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { displayTxResult } from "~~/app/debug/_components/contract";
import { useTransactor } from "~~/hooks/scaffold-eth";
// import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getParsedError } from "~~/utils/scaffold-eth";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

export function Deposit({ bundleId }: { bundleId: string }) {
  const contractsData = getAllContracts();
  const [tok1, setTok1] = useState<any>();
  const [tok2, setTok2] = useState<any>();
  // const [tok3, setTok3] = useState<any>();
  const [selectedTok, setSelectedTok] = useState<any>();
  const writeTxn = useTransactor();
  // const { chain } = useNetwork();
  // const { targetNetwork } = useTargetNetwork();
  const { address: connectedAddress } = useAccount();
  const contractName = "ETFIssuingChain";
  const xrpledgerchainId = 1440002;

  const { isFetching: isFetReq0, refetch: refReq0 } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "requiredTokens",
    abi: contractsData[contractName].abi,
    args: [0],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      console.log(parsedErrror);
    },
  });

  const { isFetching: isFetReq1, refetch: refReq1 } = useContractRead({
    address: contractsData[contractName].address,
    functionName: "requiredTokens",
    abi: contractsData[contractName].abi,
    args: [1],
    enabled: false,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      console.log(parsedErrror);
    },
  });

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
            _address: tok1 ? tok1[0] : "",
            _quantity: BigNumber.from(90).mul(BigNumber.from(10).pow(18)).toString(),
            _chainId: xrpledgerchainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
          {
            _address: tok2 ? tok2[0] : "",
            _quantity: BigNumber.from(180).mul(BigNumber.from(10).pow(18)).toString(),
            _chainId: xrpledgerchainId,
            _contributor: connectedAddress,
            _aggregator: contractsData["MockAggregator"].address,
          },
        ],
      },
    ],
  });

  const contractSimpleName = "SimpleERC20";
  const {
    data: approve,
    isLoading,
    writeAsync: approveAsync,
  } = useContractWrite({
    address: selectedTok ? selectedTok[0] : "",
    functionName: "approve",
    abi: contractsData[contractSimpleName].abi,
    args: [contractsData[contractName].address, BigNumber.from(100).mul(BigNumber.from(10).pow(18))],
  });

  useEffect(() => {
    async function fetchData(isFetching: any, refetch: any, setData: any) {
      if (isFetching) {
        return;
      }
      if (refetch) {
        const { data } = await refetch();
        console.log(data);
        setData(data);
      }
    }
    fetchData(isFetReq0, refReq0, setTok1);
    fetchData(isFetReq1, refReq1, setTok2);
    // fetchData(isFetReq2, refReq2, setTok3);
  }, [bundleId]);

  return (
    <div>
      <h1>Collateral Vault</h1>
      <p>Bundle ID: {bundleId}</p>
      {/* <button
        onClick={async () => {
          const { data } = await refetch();
          setData(data);
          console.log(data);
        }}
        disabled={isFetching}
      >
        getOwner
      </button> */}
      {(isFetReq0 || isFetReq1) && <p>Loading...</p>}
      <b>Required Tokens</b>

      {[tok1, tok2].map((tok: any) => {
        if (!tok) {
          return <></>;
        }

        return (
          <>
            {/* <p>{displayTxResult(data)}</p> */}
            <div
              //   flex direction row one next to the other
              style={{
                display: "flex",
                flexDirection: "row",
                //   justifyContent: "space-between",
                width: "100%",
                gap: "50px",
              }}
            >
              <div>
                <p>Address:</p>
                {displayTxResult(tok[0])}
              </div>
              <div>
                <p>Chain:</p>
                {displayTxResult(tok[2])}
              </div>
              <div>
                <p>Quantity:</p>
                {displayTxResult(tok[1])}
              </div>
              {Number(tok[2]) === xrpledgerchainId && (
                <div>
                  <p>Approve 100 token</p>
                  <button
                    onClick={async () => {
                      setSelectedTok(tok);
                      if (approveAsync) {
                        try {
                          const makeWriteWithParams = () => approveAsync();
                          await writeTxn(makeWriteWithParams);
                          // onChange();
                        } catch (e: any) {
                          console.log(e);
                          //   notification.error(message);
                        }
                      }
                    }}
                  >
                    Approve
                  </button>
                </div>
              )}
              {Number(tok[2]) === xrpledgerchainId && (
                <div>
                  <p>Deposit 100 token</p>
                  <button
                    onClick={async () => {
                      if (depositAsync) {
                        try {
                          const makeWriteWithParams = () => depositAsync();
                          await writeTxn(makeWriteWithParams);
                          // onChange();
                        } catch (e: any) {
                          console.log(e);
                          //   notification.error(message);
                        }
                      }
                    }}
                  >
                    Deposit
                  </button>
                </div>
              )}
            </div>
          </>
        );
      })}

      <br></br>
    </div>
  );
}
