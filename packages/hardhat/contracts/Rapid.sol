// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@redstone-finance/evm-connector/contracts/data-services/RapidDemoConsumerBase.sol";

contract RapidExample is RapidDemoConsumerBase {
	string public version = "1.0.0";

	/**
	 * Returns the latest price of ETH
	 */
	function getLatestEthPrice() public view returns (uint256) {
		bytes32 dataFeedId = bytes32("ETH");
		return getOracleNumericValueFromTxMsg(dataFeedId);
	}
}
