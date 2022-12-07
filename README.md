# Mundum Smart Contracts

There are two smart contracts in this repository:

- Mundum Token.
- Mundum Vesting.

## Mundum Token

The Mundum Token is a standard ERC20 on the Polygon network. It's deployed at

- Polygon Mainnet: [0x9EEd310a92a44ebC9Fd144d98f1772110e74B930](https://polygonscan.com/token/0x9eed310a92a44ebc9fd144d98f1772110e74b930)
- Polygon Testnet (Mumbai): [0x8c6Df6381aFc9821977a17Fc7846e229B649dE04](https://mumbai.polygonscan.com/address/0x8c6Df6381aFc9821977a17Fc7846e229B649dE04)

## Mundum Vesting

The Mundum Vesting contract allows to create a vesting schedule for a given address. It follows a centralized approach, i.e. only the owner of the contract can create vesting schedules and release tokens to the beneficiaries.

### How it works

Buyers purchase vested Mundum coins off-chain. As an incentive to vest their tokens, buyers receive a bonus, for example:

- Vesting start date (usually date of purchase): `2023-03-01`
- Vesting period: `1 year`
- Tokens purchased: `1000`
- Bonus: 70% = `700` tokens

The vested tokens (`1000`) become available to the buyer on `2024-03-01`. The bonus tokens (`700`) become available to the buyer linearly every second over the vesting period.

The contract's owner decides when to trigger the release of the available tokens to the beneficiary address. For example, the owner can release the the first batch of around `350` bonus tokens on `2023-09-01`. On `2024-03-02`, the owner can release the remaining `350` bonus tokens and the `1000` vested tokens.

There can be multiple vestings per benificiary address. Vestings are allow to start in the past or in the future. See below for additional constraints.

### Constraints And Security Measures

There are constraints in place to mitigate the risk of abuse in case the owner wallet is compromised:

- Maximum amount of `100.000.000` tokens per vesting.
- Vesting period must end at least `30 days` in the future from the point of creation (not the vesting start date).

This makes it harder for a rogue owner to quickly drain all tokens from the contract.

#### Rescuer

There is an additional wallet that can immediately drain all tokens from the contract in case the owner wallet is compromised. This wallet is called the rescuer. The owner cannot prevent the rescuer from transferring all tokens out of the contract.

The rescuer is a last resort and should be a tightly secured cold wallet. The owner is a hot wallet and has a larger attack surface.
