import { navigationConstants } from "../constants";

export interface NavigateOptions {
  replace?: boolean;
  state: any;
}

export type NavigationDestination = keyof typeof navigationConstants.paths;

export interface NavigationRequest {
  to: string;
  options?: NavigateOptions;
}

export type NavigateFn = (to: string, options?: NavigateOptions) => void;
