import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai from "chai";
import { add, getUnixTime } from "date-fns";
import { solidity } from "ethereum-waffle";
import { ethers, network } from "hardhat";
import { ERC20Vesting, ERC20Vesting__factory } from "../typechain-types";

chai.use(solidity);

const { expect } = chai;
const ZERO = BigNumber.from(0);
const BASE = BigNumber.from(10).pow(18);
const ONE_TOKEN = BigNumber.from(1).mul(BASE);

const VESTING_COIN = "0x8c6Df6381aFc9821977a17Fc7846e229B649dE04";

async function fastForward(seconds: number) {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
}

describe("ERC20Vesting", () => {
  let contract: ERC20Vesting;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let account1: SignerWithAddress;
  let account2: SignerWithAddress;

  async function init() {
    const signers = await ethers.getSigners();

    [owner, admin, account1, account2] = signers;

    const vesting = (await ethers.getContractFactory(
      "ERC20Vesting",
      owner
    )) as ERC20Vesting__factory;
    contract = await vesting.deploy(VESTING_COIN);

    await contract.deployed();
  }

  async function addClaim({
    start,
    end = add(start, { months: 12 }),
    signer = owner,
    account = account1.address,
    amountVested = ONE_TOKEN.mul(1000),
    bonusAmount = amountVested.mul(7).div(10),
  }: {
    start: Date;
    end?: Date;
    account?: string;
    signer?: SignerWithAddress;
    amountVested?: BigNumber;
    bonusAmount?: BigNumber;
  }) {
    const startSeconds = getUnixTime(start);
    const durationSeconds = getUnixTime(end) - startSeconds;

    const tx = await contract
      .connect(signer)
      .addClaim(
        account1.address,
        amountVested,
        startSeconds,
        durationSeconds,
        bonusAmount
      );

    return {
      account,
      signer,
      amountVested,
      startSeconds,
      durationSeconds,
      bonusAmount,
    };
  }

  beforeEach(async () => {
    await init();
  });

  describe("add claim", async () => {
    it("should be allowed for owner", async () => {
      const start = new Date();

      const { durationSeconds, bonusAmount, startSeconds, amountVested } =
        await addClaim({
          start,
        });
    });

    it("should be denied for non-owner", async () => {
      const start = new Date();

      await expect(
        addClaim({
          signer: account1,
          start,
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("totals of", async () => {
    it("should return totals for 1 vesting", async () => {
      const start = new Date();

      const claim = await addClaim({
        start,
      });

      await fastForward(Math.floor(claim.durationSeconds / 2));

      const [
        coinsVested,
        coinsAvailable,
        coinsClaimed,
        bonusesTotal,
        bonusesAvailable,
        bonusesClaimed,
      ] = await contract.totalsOf(account1.address);

      expect(coinsVested).to.eq(claim.amountVested);
      expect(coinsClaimed).to.eq(ZERO);
      expect(coinsAvailable).to.eq(ZERO);
      expect(bonusesTotal).to.eq(claim.bonusAmount);
      expect(bonusesClaimed).to.eq(ZERO);
      expect(bonusesAvailable).to.be.closeTo(
        claim.bonusAmount.div(2),
        ONE_TOKEN
      );
    });

    it.only("should return totals for multiple vestings", async () => {
      const start1 = new Date();
      const claim1 = await addClaim({
        start: start1,
      });

      const halfTheDuration = Math.floor(claim1.durationSeconds / 2);
      await fastForward(halfTheDuration);

      const start2 = add(start1, { seconds: halfTheDuration });
      console.log("start2", start2);

      const claim2 = await addClaim({
        start: start2,
        amountVested: ONE_TOKEN.mul(1500),
      });

      await fastForward(halfTheDuration + 3600);

      const [
        coinsVested,
        coinsClaimable,
        coinsClaimed,
        bonusesTotal,
        bonusesClaimable,
        bonusesClaimed,
      ] = await contract.totalsOf(account1.address);

      expect(coinsVested).to.eq(claim2.amountVested);
      expect(coinsClaimed).to.eq(ZERO);
      expect(coinsClaimable).to.eq(claim1.amountVested);
      expect(bonusesTotal).to.eq(claim1.bonusAmount.add(claim2.bonusAmount));
      expect(bonusesClaimed).to.eq(ZERO);
      expect(bonusesClaimable).to.be.closeTo(
        claim1.bonusAmount.add(claim2.bonusAmount.div(2)),
        ONE_TOKEN.mul(10)
      );
    });
  });
  /* test cases:
    - time < start
    - time > start + duration
    
    low: - time negative
    */
});
