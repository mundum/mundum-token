import { Contract, BigNumber } from "ethers"

export interface ContractConnection {
  chainId: number
  contract: Contract
  signerAddress: string
}

export type Totals = [
  coinsVested: BigNumber,
  coinsAvailable: BigNumber,
  coinsClaimed: BigNumber,
  bonusesTotal: BigNumber,
  bonusesAvailable: BigNumber,
  bonusesClaimed: BigNumber,
]
