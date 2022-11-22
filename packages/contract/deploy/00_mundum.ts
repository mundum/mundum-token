import { BigNumber } from "@ethersproject/bignumber";
import { DeployFunction } from "hardhat-deploy/types";
import args from "../args";

const BASE = BigNumber.from(10).pow(18);

const func: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer, r1, r2 } = await getNamedAccounts();
  console.log("***", deployer, r1, r2);

  const deployment = await deploy("Mundum", {
    from: deployer,
    // gas: 4000000,
    args,
  });
  console.log("*** MUN deployed at", deployment.address);
};

export default func;
