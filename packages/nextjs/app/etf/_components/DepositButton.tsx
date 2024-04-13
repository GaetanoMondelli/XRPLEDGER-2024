// const {
//     data: deposit,
//     isLoading: isdepLoading,
//     writeAsync: depositAsync,
//   } = useContractWrite({
//     address: contractsData[contractName].address,
//     functionName: "deposit",
//     abi: contractsData[contractName].abi,
//     args: [
//       {
//         vaultId: bundleId,
//         tokens: [
//           {
//             _address: tok1 ? tok1[0] : "",
//             _quantity: BigNumber.from(90).mul(BigNumber.from(10).pow(18)).toString(),
//             _chainId: xrpledgerchainId,
//             _contributor: connectedAddress,
//             _aggregator: contractsData["MockAggregator"].address,
//           },
//           {
//             _address: tok2 ? tok2[0] : "",
//             _quantity: BigNumber.from(180).mul(BigNumber.from(10).pow(18)).toString(),
//             _chainId: xrpledgerchainId,
//             _contributor: connectedAddress,
//             _aggregator: contractsData["MockAggregator"].address,
//           },
//         ],
//       },
//     ],
//   });


// useEffect(() => {
//     async function fetchData(isFetching: any, refetch: any, setData: any) {
//       if (isFetching) {
//         return;
//       }
//       if (refetch) {
//         const { data } = await refetch();
//         console.log(data);
//         setData(data);
//       }
//     }
//     fetchData(isFetReq0, refReq0, setTok1);
//     fetchData(isFetReq1, refReq1, setTok2);
//     // fetchData(isFetReq2, refReq2, setTok3);
//   }, [bundleId]);