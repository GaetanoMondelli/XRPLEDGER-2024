// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISimpleERC20 } from "./SimpleERC20.sol";
import "hardhat/console.sol";

struct TokenQuantity {
	address _address;
	uint256 _quantity;
	uint32 _chainId;
	address _contributor;
}

struct Vault {
	TokenQuantity[] _tokens;
	VaultState state;
}

enum VaultState {
	EMPTY,
	OPEN,
	MINTED,
	BURNED
}

struct EventInfo {
	address sender;
	uint256 quantity;
	uint32 chainId;
	address contributor;
}

struct DepositInfo {
	uint256 vaultId;
	TokenQuantity[] tokens;
}

contract ETFIssuingChain {
	address public sideChainLock;
	TokenQuantity[] public requiredTokens;
	mapping(address => TokenQuantity) public addressToToken;
	uint32 public chainId;
	address public etfToken;
	uint256 public etfTokenPerVault;

	mapping(uint256 => address[]) contributorsByVault;
	mapping(uint256 => mapping(address => uint256))
		public accountContributionsPerVault;

	event Deposit(
		uint256 _vaultId,
		address _address,
		uint256 _quantity,
		uint32 _chainId,
		address _contributor
	);

	mapping(uint256 => Vault) public vaults;

	constructor(
		uint32 _chainId,
		TokenQuantity[] memory _requiredTokens,
		address _etfToken,
		uint256 _etfTokenPerVault
	) {
		chainId = _chainId;
		etfToken = _etfToken;
		etfTokenPerVault = _etfTokenPerVault;
		for (uint256 i = 0; i < _requiredTokens.length; i++) {
			requiredTokens.push(_requiredTokens[i]);
			addressToToken[_requiredTokens[i]._address] = _requiredTokens[i];
		}
	}

	function _deposit(
		DepositInfo memory _depositInfo,
		uint32 _chainId
	) public {
		uint256 _vaultId = _depositInfo.vaultId;
		TokenQuantity[] memory _tokens = _depositInfo.tokens;
		require(
			vaults[_vaultId].state == VaultState.OPEN ||
				vaults[_vaultId].state == VaultState.EMPTY,
			"Vault is not open or empty"
		);

		if (vaults[_vaultId].state == VaultState.EMPTY) {
			for (uint256 i = 0; i < requiredTokens.length; i++) {
				vaults[_vaultId]._tokens.push(TokenQuantity(
					requiredTokens[i]._address,
					0,
					_chainId,
					address(0)
				));
			}
			vaults[_vaultId].state = VaultState.OPEN;
		}

		for (uint256 i = 0; i < _tokens.length; i++) {
			if (_tokens[i]._chainId != _chainId) {
				revert(
					"Token chainId does not match the chainId of the contract"
				);
			}
			console.log("Token address: %s", _tokens[i]._address, i, vaults[_vaultId]._tokens.length);			
			if (				
				_tokens[i]._quantity + vaults[_vaultId]._tokens[i]._quantity >
				addressToToken[_tokens[i]._address]._quantity
			) {
				revert("Token quantity exceeds the required amount");
			}

			IERC20(_tokens[i]._address).transferFrom(
				_tokens[i]._contributor,
				address(this),
				_tokens[i]._quantity
			);
			vaults[_vaultId]._tokens[i]._quantity += _tokens[i]._quantity;

			emit Deposit(
				_vaultId,
				_tokens[i]._address,
				_tokens[i]._quantity,
				_tokens[i]._chainId,
				_tokens[i]._contributor
			);

			if (accountContributionsPerVault[_vaultId][msg.sender] == 0) {
				contributorsByVault[_vaultId].push(msg.sender);
			}

			accountContributionsPerVault[_vaultId][msg.sender] += _tokens[i]
				._quantity;
		}

		for (uint256 i = 0; i < requiredTokens.length; i++) {
			if (
				vaults[_vaultId]._tokens[i]._quantity <
				requiredTokens[i]._quantity
			) {
				return;
			}
		}
		vaults[_vaultId].state = VaultState.MINTED;
	}

}
