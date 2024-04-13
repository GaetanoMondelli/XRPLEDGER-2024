import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { SimpleERC20, ETFIssuingChain } from "../typechain-types";
// import { NonceManager, Signer } from 'ethers';
// import * as CORE_DEPLOYMENT from "../../../../bridge/artifacts/core-deployment-2024-04-11-01-28-34.json";
// import * as RECEIVER_DEPLOYMENT from "../deployments/sepolia/HyperlaneMessageReceiver.json";
import { BigNumber } from "@ethersproject/bignumber";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const xrpledgerChainId = 1440002;
  const decimalFactor = BigNumber.from(10).pow(18);
  const tokenPerVault = BigNumber.from(100).mul(decimalFactor).toString();

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  console.log("Deploying ETF contract");
  if (hre.network.name === "xrpledger") {
    //deploy tokenA and tokenB contracts

    const requiredTokens = [
      {
        _address: "",
        _quantity: BigNumber.from(100).mul(decimalFactor).toString(),
        _chainId: xrpledgerChainId,
        _contributor: deployer,
        _aggregator: "",
      },
      {
        _address: "",
        _quantity: BigNumber.from(200).mul(decimalFactor).toString(),
        _chainId: xrpledgerChainId,
        _contributor: deployer,
        _aggregator: "",
      },
    ];

    await deploy("SimpleERC20", {
      from: deployer,
      args: ["TokenA", "TA", 0],
      log: true,
    });

    await sleep(10000);

    const t1 = await hre.ethers.getContract<SimpleERC20>("SimpleERC20", deployer);
    await t1.mint(deployer, BigNumber.from(1000).mul(BigNumber.from(10).pow(18)).toString());
    await sleep(10000);

    await deploy("SimpleERC20", {
      from: deployer,
      args: ["TokenB", "TB", 0],
      log: true,
    });

    const t2 = await hre.ethers.getContract<SimpleERC20>("SimpleERC20", deployer);
    await t2.mint(deployer, BigNumber.from(1000).mul(BigNumber.from(10).pow(18)).toString());
    await sleep(10000);

    await deploy("MockAggregator", {
      from: deployer,
      args: [20, 18],
      log: true,
    });
    await sleep(10000);
    const aggr1 = await hre.ethers.getContract("MockAggregator", deployer);

    await deploy("MockAggregator", {
      from: deployer,
      args: [10, 18],
      log: true,
    });
    await sleep(10000);
    const aggr2 = await hre.ethers.getContract("MockAggregator", deployer);

    requiredTokens[0]._address = await t1.getAddress();
    requiredTokens[0]._aggregator = await aggr1.getAddress();
    requiredTokens[1]._address = await t2.getAddress();
    requiredTokens[1]._aggregator = await aggr2.getAddress();

    await deploy("SimpleERC20", {
      from: deployer,
      args: ["ETFToken", "ETF", 0],
      log: true,
    });
    await sleep(10000);
    const etfToken = await hre.ethers.getContract<SimpleERC20>("SimpleERC20", deployer);
    console.log("ETF Token address: ", await etfToken.getAddress());

    await deploy("ETFIssuingChain", {
      from: deployer,
      args: [xrpledgerChainId, requiredTokens, await etfToken.getAddress(), tokenPerVault],
      log: true,
    });
    await sleep(20000);

    const etf = await hre.ethers.getContract<ETFIssuingChain>("ETFIssuingChain", deployer);
    await etfToken.setOwner(await etf.getAddress());
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["etf"];
