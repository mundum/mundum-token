import domain from "~/domain"
import { Env, InitContext } from "../types"

export const envEvents = {
  initContextReceived: domain.meta.createEvent<InitContext>(),
  initialized: domain.meta.createEvent<Env>(),
  dateFnProvided: domain.meta.createEvent<() => Date>(),
}
