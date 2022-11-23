import domain from "~/domain"
import { ContractConnection, Totals } from "~/services/contract/types"
import { Transaction } from "ethers"

export const contractEvents = {
  web3ConnectionRequested: domain.core.createEvent(),
  contractConnected: domain.core.createEvent<ContractConnection>(),
  accountChanged: domain.core.createEvent<string>(),
  amountChanged: domain.core.createEvent<string>(),
  bonusChanged: domain.core.createEvent<string>(),
  startChanged: domain.core.createEvent<Date>(),
  endChanged: domain.core.createEvent<Date>(),
  totalsRequested: domain.core.createEvent(),
  totalsAtRequested: domain.core.createEvent<Date>(),
  totalsReceived: domain.core.createEvent<Totals>(),
  addClaimRequested: domain.core.createEvent(),
  addClaimSucceeded: domain.core.createEvent<Transaction>(),
  addClaimFailed: domain.core.createEvent(),
  claimRequested: domain.core.createEvent(),
  claimSucceeded: domain.core.createEvent<Transaction>(),
  claimFailed: domain.core.createEvent(),
}
