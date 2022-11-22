export type Env = "development" | "production"

export interface InitContext {
  mode: Env
  initFn: () => void
}
