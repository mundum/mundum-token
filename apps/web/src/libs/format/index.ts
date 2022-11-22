import { parseISO } from "date-fns"
import dformat from "date-fns/format"
import formatDistance from "date-fns/formatDistance"
import { BigNumberish, ethers } from "ethers"

function units(bn: BigNumberish) {
  return ethers.utils.formatUnits(bn)
}

function nativeNum(num: string) {
  return num ? num.replace(/,/g, "") : num
}

function bigNumber(num: string) {
  const parsedUnits = ethers.utils.parseUnits(num)
  return parsedUnits.toString()
}

function bigNumberHex(num: string) {
  const parsedUnits = ethers.utils.parseUnits(num)
  return parsedUnits.toHexString()
}

function date(d?: Date | null): string {
  return d ? dformat(d instanceof Date ? d : parseISO(d), "dd.MM.yyyy") : ""
}

function timestamp(d?: Date | null): string {
  return d
    ? dformat(d instanceof Date ? d : parseISO(d), "dd.MM.yyyy hh:mm:ss")
    : ""
}

function age(d?: Date | null): string {
  return d
    ? formatDistance(d instanceof Date ? d : parseISO(d), new Date())
    : ""
}

export const frmt = {
  units,
  bigNumber,
  bigNumberHex,
  date,
  timestamp,
  age,
  nativeNum,
  explorer(chainId: number, txid?: string): string {
    return chainId === 137
      ? `https://polygonscan.com/tx/${txid}`
      : chainId === 80001
      ? `https://mumbai.polygonscan.com/tx/${txid}`
      : `https://${chainId === 3 ? "ropsten." : ""}etherscan.io/tx/${txid}`
  },
  explorerAddr(chainId: number, addr?: string): string {
    return chainId === 137
      ? `https://polygonscan.com/address/${addr}`
      : chainId === 80001
      ? `https://mumbai.polygonscan.com/address/${addr}`
      : `https://${chainId === 3 ? "ropsten." : ""}etherscan.io/address/${addr}`
  },
}
