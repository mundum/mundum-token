import { BigNumber, Contract, ethers } from "ethers"
import { Totals } from "./types"

declare global {
  interface Window {
    ethereum: any
  }
}

const vestingAbi = [
  "function totalsOfAt(address, uint128) view returns (tuple(uint, uint, uint, uint, uint, uint))",
  "function totalsOf(address) view returns (tuple(uint, uint, uint, uint, uint, uint))",
  "function addClaim(address, uint, uint, uint, uint)",
  "function claim(address)",
  "event Vested(address indexed, uint, uint, uint, uint)",
]

type ChainId = number

const contractAddress: Record<ChainId, string> = {
  //   31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  80001: "0x1C76F31BF9F1d356f5349c0d5B8cEEDD4a1dc567",
}

async function connect() {
  if (window.ethereum !== undefined) {
    await window.ethereum.enable()
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const chainId = (await provider.getNetwork()).chainId
    const signer = provider.getSigner()

    const contract = new ethers.Contract(
      contractAddress[chainId],
      vestingAbi,
    ).connect(signer)
    const signerAddress = await signer.getAddress()
    return { chainId, contract, signerAddress }
  } else {
    throw new Error("No injected web3 found")
  }
}

async function totalsOf({
  contract,
  account,
}: {
  contract: Contract
  account: string
}): Promise<Totals> {
  return await contract.totalsOf(account)
}

async function totalsOfAt({
  contract,
  account,
  atUnix,
}: {
  contract: Contract
  account: string
  atUnix: number
}): Promise<Totals> {
  return await contract.totalsOfAt(account, atUnix)
}

async function addClaim({
  contract,
  benificiary,
  amountUnits,
  bonusAmount,
  durationUnix,
  startUnix,
}: {
  contract: Contract
  benificiary: string
  amountUnits: BigNumber
  startUnix: number
  durationUnix: number
  bonusAmount: BigNumber
}) {
  return await contract.addClaim(
    benificiary,
    amountUnits,
    startUnix,
    durationUnix,
    bonusAmount,
  )
}
async function claim({
  contract,
  account,
}: {
  contract: Contract
  account: string
}) {
  return await contract.claim(account)
}

export const contractService = {
  connect,
  totalsOf,
  totalsOfAt,
  addClaim,
  claim,
}