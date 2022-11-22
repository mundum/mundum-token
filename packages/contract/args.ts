import { BigNumber } from "@ethersproject/bignumber";

const BASE = BigNumber.from(10).pow(18);

const args = ["Mundum Coin", "MUN", BASE.mul("1500000000")];

export default args;
