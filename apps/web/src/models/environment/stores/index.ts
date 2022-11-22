import domain from "~/domain"
import { envEvents } from "../events"
import { Env, InitContext } from "../types"

export const envStores = {
  initStarted: domain.meta
    .createStore<boolean>(false)
    .on(envEvents.initContextReceived, () => true),
  initContext: domain.meta
    .createStore<InitContext | null>(null)
    .on(envEvents.initContextReceived, (_, payload) => payload),
  dateFn: domain.meta
    .createStore<() => Date>(() => new Date())
    .on(envEvents.dateFnProvided, (_, payload) => payload),
  env: domain.meta
    .createStore<Env>("production")
    .on(envEvents.initialized, (_, payload) => payload),
}
