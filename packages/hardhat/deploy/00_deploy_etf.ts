import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { SimpleERC20, ETFIssuingChain } from "../typechain-types";
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

    for (let i = 0; i < requiredTokens.length; i++) {
      await deploy("SimpleERC20", {
        from: deployer,
        args: ["Token" + i, "TK" + i, 0],
        log: true,
      });
      await deploy("MockAggregator", {
        from: deployer,
        args: [10 * i, 18],
        log: true,
      });
      const t = await hre.ethers.getContract<SimpleERC20>("SimpleERC20", deployer);
      await t.mint(deployer, BigNumber.from(1000).mul(BigNumber.from(10).pow(18)).toString());
      requiredTokens[i]._address = await t.getAddress();
      requiredTokens[i]._aggregator = await (await hre.ethers.getContract("MockAggregator", deployer)).getAddress();
    }

    await deploy("SimpleERC20", {
      from: deployer,
      args: ["ETFToken", "ETF", 0],
      log: true,
    });
    const etfToken = await hre.ethers.getContract<SimpleERC20>("SimpleERC20", deployer);
    console.log("ETF Token address: ", await etfToken.getAddress());

    await deploy("ETF Lock on issuing chain", {
      from: deployer,
      args: [xrpledgerChainId, requiredTokens, await etfToken.getAddress(), tokenPerVault],
      log: true,
    });
    const etf = await hre.ethers.getContract<ETFIssuingChain>("ETFIssuingChain", deployer);
    await etfToken.setOwner(await etf.getAddress());
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["etf"];
