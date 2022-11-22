import { BigNumber } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import args from "../args-vesting";

const BASE = BigNumber.from(10).pow(18);

const func: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer, r1, r2 } = await getNamedAccounts();
  console.log("***", deployer, r1, r2);

  const deployment = await deploy("ERC20Vesting", {
    from: deployer,
    args,
  });
  console.log("*** Vesting contract deployed at", deployment.address);
};

func.tags = ["vesting"];
export default func;
