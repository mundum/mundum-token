import { BigNumber } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import args from "../args-vesting-verify-mumbai";

const BASE = BigNumber.from(10).pow(18);

const argsForChain: Record<string, [string, string]> = {
  137: [
    "0x9EEd310a92a44ebC9Fd144d98f1772110e74B930",
    "0xDac34A9757BAd176e7914bDC29Ac1250B8EE82C5",
  ],
  80001: [
    "0x8c6Df6381aFc9821977a17Fc7846e229B649dE04",
    "0xDac34A9757BAd176e7914bDC29Ac1250B8EE82C5",
  ],
};

const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  getChainId,
}) => {
  const { deploy } = deployments;
  const { deployer, r1, r2 } = await getNamedAccounts();
  const chainId = await getChainId();
  console.log("***", deployer, r1, r2);

  const deployment = await deploy("ERC20Vesting", {
    from: deployer,
    args: argsForChain[chainId],
  });
  console.log("*** Vesting contract deployed at", deployment.address);
};

func.tags = ["vesting"];
export default func;
