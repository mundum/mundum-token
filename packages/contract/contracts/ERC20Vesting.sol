// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./token/ERC20/ERC20.sol";
import "./math/SafeMath.sol";
import "./utils/Arrays.sol";
import "./access/Ownable.sol";
import "hardhat/console.sol";

contract ERC20Vesting is Ownable {
    event Vested(
        address indexed beneficiary,
        uint256 amount,
        uint256 start,
        uint256 duration,
        uint256 bonusAmount
    );

    event BonusesClaimed(address indexed beneficiary, uint256 amount);

    event AllClaimed(address indexed beneficiary, uint256 amount);

    struct Vesting {
        uint256 amount;
        uint256 start;
        uint256 duration;
        uint256 bonusAmount;
    }

    struct Totals {
        uint256 coinsVested;
        uint256 coinsAvailable;
        uint256 coinsClaimed;
        uint256 bonusesTotal;
        uint256 bonusesAvailable;
        uint256 bonusesClaimed;
    }

    using Arrays for uint256[];

    address private _token;

    mapping(address => Vesting[]) private _vestings;
    mapping(address => uint256) private _bonusesClaimed;
    mapping(address => uint256) private _coinsClaimed;

    constructor(address vestedToken) payable Ownable() {
        require(
            vestedToken != address(0),
            "ERC20Vesting: Cannot use 0 address as vested token."
        );
        _token = vestedToken;
    }

    function _hasVesting(address account) private view returns (bool) {
        return _vestings[account].length > 0;
    }

    function _today() internal view virtual returns (uint128) {
        return uint128(block.timestamp);
    }

    function _totalsAt(address beneficiary, uint128 time)
        internal
        view
        returns (Totals memory)
    {
        uint256 bonusesTotal = 0;
        uint256 bonusesAvailable = 0;
        uint256 coinsVested = 0;
        uint256 coinsAvailable = 0;
        for (uint256 i = 0; i < _vestings[beneficiary].length; i++) {
            Vesting memory v = _vestings[beneficiary][i];
            if (time >= v.start + v.duration) {
                coinsAvailable += v.amount;
                bonusesAvailable += v.bonusAmount;
            } else {
                if (time >= v.start) {
                    coinsVested += v.amount;
                    uint256 bonus = (v.bonusAmount * (time - v.start)) /
                        v.duration;
                    bonusesAvailable += bonus;
                }
            }
            bonusesTotal += v.bonusAmount;
        }

        uint256 bonusesClaimed = _bonusesClaimed[beneficiary];
        uint256 coinsClaimed = _coinsClaimed[beneficiary];
        return
            Totals(
                coinsVested,
                coinsAvailable,
                coinsClaimed,
                bonusesTotal,
                bonusesAvailable,
                bonusesClaimed
            );
    }

    function _totals(address beneficiary)
        internal
        view
        returns (Totals memory)
    {
        return _totalsAt(beneficiary, _today());
    }

    function totalsOf(address account) public view returns (Totals memory) {
        return _totalsAt(account, _today());
    }

    function totalsOfAt(address account, uint128 time)
        public
        view
        returns (Totals memory)
    {
        return _totalsAt(account, time);
    }

    function addClaim(
        address beneficiary,
        uint256 amount,
        uint256 start,
        uint256 duration,
        uint256 bonusAmount
    ) public onlyOwner {
        require(
            amount > 0,
            "ERC20Vesting: Amount vested must be larger than 0."
        );
        require(
            beneficiary != address(0),
            "ERC20Vesting: Zero address cannot be beneficiary."
        );
        Vesting[] storage vestings = _vestings[beneficiary];
        vestings.push(Vesting(amount, start, duration, bonusAmount));
        emit Vested(beneficiary, amount, start, duration, bonusAmount);
    }

    function claimBonuses(address account) public onlyOwner {
        Totals memory totals = _totals(account);
        require(
            totals.bonusesAvailable > totals.bonusesClaimed,
            "ERC20Vesting: Already claimed all bonuses."
        );
        uint256 bonusesClaimable = totals.bonusesAvailable -
            totals.bonusesClaimed;
        _bonusesClaimed[account] += bonusesClaimable;
        ERC20(_token).transfer(account, bonusesClaimable);
        emit BonusesClaimed(account, bonusesClaimable);
    }

    function claimAll(address account) public onlyOwner {
        Totals memory totals = _totals(account);
        require(
            totals.coinsAvailable > 0 || totals.bonusesAvailable > 0,
            "ERC20Vesting: Nothing to claim."
        );
        require(
            totals.coinsAvailable > totals.coinsClaimed ||
                totals.bonusesAvailable > totals.bonusesClaimed,
            "ERC20Vesting: Already claimed everything."
        );
        uint256 bonusesClaimable = totals.bonusesAvailable -
            totals.bonusesClaimed;
        uint256 coinsClaimable = totals.coinsAvailable - totals.coinsClaimed;
        _coinsClaimed[account] += coinsClaimable;
        _bonusesClaimed[account] += bonusesClaimable;
        uint256 amount = coinsClaimable + bonusesClaimable;
        ERC20(_token).transfer(account, amount);
        emit AllClaimed(account, amount);
    }
}
