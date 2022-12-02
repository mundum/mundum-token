// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "./token/ERC20/ERC20.sol";
import "./access/Ownable.sol";
import "./security/Pausable.sol";
import "hardhat/console.sol";

/**
 * @notice A token holder contract that releases its token balance according to a
 * vesting schedule.
 */
contract ERC20Vesting is Ownable, Pausable {
    // ======== Events =========

    /**
     * @dev Emitted when a vesting schedule is created in `addClaim`.
     * @param beneficiary Address that receives the coins and bonuses.
     * @param amount Amount of coins to be vested.
     * @param start Timestamp when the vesting starts.
     * @param duration Duration in seconds of the vesting period.
     * @param bonusAmount The bonus that becomes available during the vesting period.
     */
    event Vested(
        address indexed beneficiary,
        uint256 amount,
        uint256 start,
        uint256 duration,
        uint256 bonusAmount
    );

    /**
     * @dev Emitted when coins and bonusses are claimed in `claim`.
     * @param beneficiary Address that received the coins and bonuses.
     * @param amount Amount of coins that were claimed.
     */
    event AllClaimed(address indexed beneficiary, uint256 amount);

    // ======== Structs =========

    /**
     * @dev Struct to store one vesting schedule of a beneficiary.
     * @param amount Amount of coins to be vested.
     * @param start Timestamp when the vesting starts.
     * @param duration Duration in seconds of the vesting period.
     * @param bonusAmount The bonus that becomes available during the vesting period.
     */
    struct Vesting {
        uint256 amount;
        uint256 start;
        uint256 duration;
        uint256 bonusAmount;
    }

    /**
     * @dev Vesting statistics at a point in time.
     * @param coinsTotal Total amount of coins that are vested over all vestings.
     * @param coinsAvailable Total amount of coins that have become available (claimed or not ).
     * @param coinsClaimed Total amount of coins that have already been claimed.
     * @param bonusesTotal Total amount of bonus amounts over all vestings.
     * @param bonusesAvailable Total amount of bonuses that have become available (claimed or not).
     * @param bonusesClaimed Total amount of bonuses that have already been claimed.
     */
    struct Totals {
        uint256 coinsTotal;
        uint256 coinsAvailable;
        uint256 coinsClaimed;
        uint256 bonusesTotal;
        uint256 bonusesAvailable;
        uint256 bonusesClaimed;
    }

    // ======== Constant Fields =========

    uint256 private constant ONE_TOKEN = 10 ** 18;

    uint256 public constant MAX_VESTING_AMOUNT = ONE_TOKEN * 100000000; // 100 million tokens
    /**
     * @dev Minimum days in the future that the vesting must end.
     */
    uint256 public constant MIN_FUTURE_END = 30 days;

    // ======== Immuntable Fields =========

    /**
     * @notice The token that is being vested.
     * @dev The token must implement the ERC20 interface.
     */
    address public immutable token;

    address public immutable rescuer;

    // ======== Private Storage =========

    mapping(address => Vesting[]) private _vestings;
    mapping(address => uint256) private _bonusesClaimed;
    mapping(address => uint256) private _coinsClaimed;

    // ======== Constructor =========

    constructor(address _token, address _rescuer) payable Ownable() {
        require(
            _token != address(0),
            "ERC20Vesting: Cannot use 0 address as vesting token."
        );
        token = _token;
        rescuer = _rescuer;
    }

    // ======== External State Chainging Functions =========

    /**
     * @notice Creates a new vesting schedule for a beneficiary.
     * @dev Accessible only by owner. Emits the `Vested` event.
     * @param beneficiary Address that receives the coins and bonuses.
     * @param amount Amount of coins to be vested.
     * @param start Timestamp when the vesting starts.
     * @param duration Duration in seconds of the vesting period.
     * @param bonusAmount The bonus that becomes available during the vesting period.
     */
    function addClaim(
        address beneficiary,
        uint256 amount,
        uint256 start,
        uint256 duration,
        uint256 bonusAmount
    ) external onlyOwner whenNotPaused {
        require(
            amount > 0,
            "ERC20Vesting: Amount vested must be larger than 0."
        );
        require(
            amount <= MAX_VESTING_AMOUNT,
            "ERC20Vesting: Amount vested exceeds maximum."
        );
        require(
            start + duration >= _today() + MIN_FUTURE_END,
            "ERC20Vesting: Vesting ends too soon."
        );
        require(
            beneficiary != address(0),
            "ERC20Vesting: Zero address cannot be beneficiary."
        );

        Vesting[] storage vestings = _vestings[beneficiary];
        vestings.push(Vesting(amount, start, duration, bonusAmount));

        emit Vested(beneficiary, amount, start, duration, bonusAmount);
    }

    /**
     * @notice Claims (transfers) all currently free coins and claimable bonuses for a beneficiary.
     * @param account Address that receives the coins and bonuses.
     * @dev Accessible only by owner.
     * Can be called many times. Reverts if nothing can be claimed.
     * Transfers the claimable coins and bonuses to `account`.
     * Emits the `AllClaimed` event.
     */
    function claimAll(address account) external onlyOwner whenNotPaused {
        // === Checks ===
        // Fetch current totals and revert if nothing can be claimed.
        Totals memory totals = _totalsOfAt(account, _today());
        require(
            totals.coinsAvailable > 0 || totals.bonusesAvailable > 0,
            "ERC20Vesting: Nothing to claim."
        );
        require(
            totals.coinsAvailable > totals.coinsClaimed ||
                totals.bonusesAvailable > totals.bonusesClaimed,
            "ERC20Vesting: Already claimed everything."
        );

        // === Effects ===
        // Calculate claimable amounts.
        uint256 bonusesClaimable = totals.bonusesAvailable -
            totals.bonusesClaimed;
        uint256 coinsClaimable = totals.coinsAvailable - totals.coinsClaimed;

        // Update claimed amounts.
        _coinsClaimed[account] += coinsClaimable;
        _bonusesClaimed[account] += bonusesClaimable;

        // === Interactions ===
        // Transfer claimable amount.
        uint256 claimableAmount = coinsClaimable + bonusesClaimable;
        ERC20(token).transfer(account, claimableAmount);

        emit AllClaimed(account, claimableAmount);
    }

    /**
     * @notice Pauses the contract. `addClaim` and `claimAll` cannot be called.
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Rescues entire `token` balance from the contract.
     * @dev Accessible only by immutable `rescuer` defined at construction.
     */
    function rescue() external onlyRescuer {
        ERC20(token).transfer(rescuer, ERC20(token).balanceOf(address(this)));
    }

    // ======== External View Functions =========

    /**
     * @return Current statics about the vesting schedules of a beneficiary.
     */
    function totalsOf(address account) external view returns (Totals memory) {
        return _totalsOfAt(account, _today());
    }

    /**
     * @return Statics about the vesting schedules of a beneficiary
     * at a certain point in time. This allows to project the future state of the vesting schedules.
     */
    function totalsOfAt(
        address account,
        uint128 time
    ) external view returns (Totals memory) {
        return _totalsOfAt(account, time);
    }

    // ======== Internal Functions =========

    function _today() internal view virtual returns (uint128) {
        return uint128(block.timestamp);
    }

    /**
     * @dev Calculates the total (over all vestings) amount of coins and bonuses that are vested
     * and available for a beneficiary. The bonus amount becomes available linearly with time
     * during the vesting period. The coin amount becomes available at the end of the vesting period.
     */
    function _totalsOfAt(
        address beneficiary,
        uint128 time
    ) internal view returns (Totals memory) {
        uint256 bonusesTotal = 0;
        uint256 bonusesAvailable = 0;
        uint256 coinsTotal = 0;
        uint256 coinsAvailable = 0;
        for (uint256 i = 0; i < _vestings[beneficiary].length; i++) {
            Vesting memory v = _vestings[beneficiary][i];
            if (time >= v.start + v.duration) {
                // Vesting has ended, everything is available.
                coinsAvailable += v.amount;
                bonusesAvailable += v.bonusAmount;
            } else {
                // Vesting has not yet started or has not ended.
                if (time >= v.start) {
                    // Vesting has started, but not yet ended. Only bonus is available.
                    uint256 bonus = (v.bonusAmount * (time - v.start)) /
                        v.duration;
                    bonusesAvailable += bonus;
                }
            }
            // Totals are time independent.
            coinsTotal += v.amount;
            bonusesTotal += v.bonusAmount;
        }

        // We don't track individual claims. This claimed amounts are time independent.
        uint256 coinsClaimed = _coinsClaimed[beneficiary];
        uint256 bonusesClaimed = _bonusesClaimed[beneficiary];
        return
            Totals(
                coinsTotal,
                coinsAvailable,
                coinsClaimed,
                bonusesTotal,
                bonusesAvailable,
                bonusesClaimed
            );
    }

    modifier onlyRescuer() {
        require(
            msg.sender == rescuer,
            "ERC20Vesting: Caller is not the rescuer"
        );
        _;
    }
}
