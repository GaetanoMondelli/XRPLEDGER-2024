import { expect } from "chai";
import { ethers } from "hardhat";
import { ETFIssuingChain, SimpleERC20 } from "../typechain-types";
import { BigNumber } from "@ethersproject/bignumber";

describe("Hyperlane Bridge", function () {
  // We define a fixture to reuse the same setup in every test.
  let owner: any;
  let etf: ETFLock;
  let etfToken: SimpleERC20;
  let tokenA: SimpleERC20;
  let tokenB: SimpleERC20;
  const domain = 1440002;
  const decimalFactor = BigNumber.from(10).pow(18);
  const tokenPerVault = BigNumber.from(100).mul(decimalFactor).toString();
  let requiredTokens: any[];

  before(async () => {
    [owner] = await ethers.getSigners();
    const etfLockFactory = await ethers.getContractFactory("ETFLock");
    const simpleFactory = await ethers.getContractFactory("SimpleERC20");

    etfToken = (await simpleFactory.deploy("ETF Token", "ETF",0)) as SimpleERC20;
    tokenA = (await simpleFactory.deploy("TokenA", "TKA", 18)) as SimpleERC20;
    tokenB = (await simpleFactory.deploy("TokenB", "TKB", 18)) as SimpleERC20;

    requiredTokens = [
      {
        _address: await tokenA.getAddress(),
        _quantity: BigNumber.from(10).mul(decimalFactor).toString(),
        _chainId: domain,
        _contributor: owner.address,
      },
      {
        _address: await tokenB.getAddress(),
        _quantity: BigNumber.from(20).mul(decimalFactor).toString(),
        _chainId: domain,
        _contributor: owner.address,
      },
    ];

    etf = (await etfLockFactory.deploy(domain, requiredTokens, etfToken, tokenPerVault)) as ETFLock;
    await etfToken.setOwner(await etf.getAddress());
    await tokenA.approve(await etf.getAddress(), BigNumber.from(1000).mul(decimalFactor).toString());
    await tokenB.approve(await etf.getAddress(), BigNumber.from(1000).mul(decimalFactor).toString());
  });

  it("Should have deployed the etf lock", async function () {
    const etfAddress = await etf.getAddress();
    expect(await etfAddress).to.be.not.null;
  });
});
