import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";

describe("ETF on issuing chain", function () {
  // We define a fixture to reuse the same setup in every test.
  const domain = 42;
  const decimalFactor = BigNumber.from(10).pow(18);
  const tokenPerVault = BigNumber.from(100).mul(decimalFactor).toString();
  let requiredTokens: any[];

  before(async () => {
    [owner] = await ethers.getSigners();
    const etfLockFactory = await ethers.getContractFactory("ETFIssuingChain");
    const simpleFactory = await ethers.getContractFactory("SimpleERC20");
  });

  it("Should have deployed the etf lock", async function () {
    const etfAddress = await etf.getAddress();
    expect(await etfAddress).to.be.not.null;
  });

});
