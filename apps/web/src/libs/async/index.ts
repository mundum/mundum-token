import { createStore, merge, Store, Unit } from 'effector';

export const asyncLib = {
  pendingStore({
    start,
    end,
  }: {
    readonly start: Unit<any>;
    readonly end: Unit<any>;
  }): Store<boolean> {
    return createStore<boolean>(false)
      .on(start, () => true)
      .on(end, () => false);
  },
};
