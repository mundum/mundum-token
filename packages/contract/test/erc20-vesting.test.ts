import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai from "chai";
import { add, getUnixTime } from "date-fns";
import { solidity } from "ethereum-waffle";
import { ethers, network } from "hardhat";
import {
  ERC20Vesting,
  ERC20Vesting__factory,
  Mundum,
  Mundum__factory,
} from "../typechain-types";

chai.use(solidity);

const { expect } = chai;
const ZERO = BigNumber.from(0);
const BASE = BigNumber.from(10).pow(18);
const ONE_TOKEN = BigNumber.from(1).mul(BASE);
const INITIAL_VESTING_CONTRACT_TOKEN_BALANCE = ONE_TOKEN.mul(5000000);

const ONE_HOUR_IN_SECONDS = 3600;

async function evmFastForward(seconds: number) {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
}

describe("ERC20Vesting", () => {
  let mundum: Mundum;
  let vesting: ERC20Vesting;
  let owner: SignerWithAddress;
  let rescuer: SignerWithAddress;
  let account1: SignerWithAddress;
  let account2: SignerWithAddress;

  async function init() {
    await network.provider.send("hardhat_reset");
    const signers = await ethers.getSigners();

    [owner, rescuer, account1, account2] = signers;

    const mundumFactory = (await ethers.getContractFactory(
      "Mundum",
      owner
    )) as Mundum__factory;
    mundum = await mundumFactory.deploy(
      "Mundum",
      "MNDM",
      ONE_TOKEN.mul(1_500_000_000)
    );
    await mundum.deployed();

    const vestingFactory = (await ethers.getContractFactory(
      "ERC20Vesting",
      owner
    )) as ERC20Vesting__factory;
    vesting = await vestingFactory.deploy(mundum.address, rescuer.address);

    await vesting.deployed();

    await mundum
      .connect(owner)
      .transfer(vesting.address, INITIAL_VESTING_CONTRACT_TOKEN_BALANCE);
  }

  async function addClaim({
    start = new Date(),
    end = add(start, { months: 12 }),
    signer = owner,
    account = account1.address,
    amountVested = ONE_TOKEN.mul(1000),
    bonusAmount = amountVested.mul(7).div(10),
  }: {
    start?: Date;
    end?: Date;
    account?: string;
    signer?: SignerWithAddress;
    amountVested?: BigNumber;
    bonusAmount?: BigNumber;
  }) {
    const startSeconds = getUnixTime(start);
    const durationSeconds = getUnixTime(end) - startSeconds;

    const tx = await vesting
      .connect(signer)
      .addClaim(
        account,
        amountVested,
        startSeconds,
        durationSeconds,
        bonusAmount
      );

    return {
      tx,
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

  describe("constructor", async () => {
    it("should not accept the zero address as token", async () => {
      const factory = (await ethers.getContractFactory(
        "ERC20Vesting",
        owner
      )) as ERC20Vesting__factory;
      await expect(
        factory.deploy(ethers.constants.AddressZero, rescuer.address)
      ).to.be.revertedWith(
        "ERC20Vesting: Cannot use 0 address as vesting token."
      );
    });
  });

  describe("pause", () => {
    it("should allow owner to pause", async () => {
      await vesting.pause();
      expect(await vesting.paused()).to.be.true;
    });
    it("should not allow rescuer to pause", async () => {
      await expect(vesting.connect(rescuer).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
    it("should not allow non-owner to pause", async () => {
      await expect(vesting.connect(account1).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("should allow owner to unpause", async () => {
      await vesting.pause();
      await vesting.unpause();
      expect(await vesting.paused()).to.be.false;
    });
    it("should not allow rescuer to unpause", async () => {
      await vesting.pause();
      await expect(vesting.connect(rescuer).unpause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
    it("should not allow non-owner to unpause", async () => {
      await vesting.pause();
      await expect(vesting.connect(account1).unpause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });
  describe("rescue", () => {
    it("should allow rescuer to rescue tokens", async () => {
      await vesting.connect(rescuer).rescue();

      const vestingContractBalanceAfterRescue = await mundum.balanceOf(
        vesting.address
      );
      const rescuerBalanceAfterRescue = await mundum.balanceOf(rescuer.address);
      expect(vestingContractBalanceAfterRescue).to.eq(ZERO);
      expect(rescuerBalanceAfterRescue).to.eq(
        INITIAL_VESTING_CONTRACT_TOKEN_BALANCE
      );
    });

    it("should allow rescuer to rescue tokens even if contract is paused", async () => {
      await vesting.pause();
      await vesting.connect(rescuer).rescue();

      const vestingContractBalanceAfterRescue = await mundum.balanceOf(
        vesting.address
      );
      const rescuerBalanceAfterRescue = await mundum.balanceOf(rescuer.address);
      expect(vestingContractBalanceAfterRescue).to.eq(ZERO);
      expect(rescuerBalanceAfterRescue).to.eq(
        INITIAL_VESTING_CONTRACT_TOKEN_BALANCE
      );
    });

    it("should not allow owner to rescue tokens", async () => {
      await expect(vesting.connect(owner).rescue()).to.be.revertedWith(
        "ERC20Vesting: Caller is not the rescuer"
      );
    });

    it("should not allow non-rescuer to rescue tokens", async () => {
      await expect(vesting.connect(account1).rescue()).to.be.revertedWith(
        "ERC20Vesting: Caller is not the rescuer"
      );
    });
  });

  describe("addClaim", async () => {
    it("should be allowed for owner", async () => {
      const { durationSeconds, bonusAmount, startSeconds, amountVested } =
        await addClaim({});
    });

    it("should be denied for non-owner", async () => {
      await expect(
        addClaim({
          signer: account1,
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should be denied for rescuer", async () => {
      await expect(
        addClaim({
          signer: rescuer,
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should be denied if paused", async () => {
      await vesting.pause();
      await expect(addClaim({})).to.be.revertedWith("Pausable: paused");
    });
    it("should reject zero address as benificiary", async () => {
      await expect(
        addClaim({ account: ethers.constants.AddressZero })
      ).to.be.revertedWith("ERC20Vesting: Zero address cannot be beneficiary.");
    });
    it("should reject zero as amount", async () => {
      await expect(addClaim({ amountVested: ZERO })).to.be.revertedWith(
        "ERC20Vesting: Amount vested must be larger than 0."
      );
    });
    it("should reject amount exceeding max", async () => {
      await expect(
        addClaim({ amountVested: ONE_TOKEN.mul(100_000_001) })
      ).to.be.revertedWith("ERC20Vesting: Amount vested exceeds maximum.");
    });
    it("should accept max amount", async () => {
      await addClaim({ amountVested: ONE_TOKEN.mul(100_000_000) });
    });
    it("should reject duration less than min", async () => {
      const start = new Date();
      const end = add(start, { days: 29 });
      await expect(addClaim({ start, end })).to.be.revertedWith(
        "ERC20Vesting: Vesting ends too soon."
      );
    });
    it("should reject duration that ends too soon.", async () => {
      const start = add(new Date(), { days: -100 });
      const end = add(start, { days: 120 });
      await expect(addClaim({ start, end })).to.be.revertedWith(
        "ERC20Vesting: Vesting ends too soon."
      );
    });
    it("should accept min duration", async () => {
      const start = new Date();
      const end = add(start, { days: 30 });
      await addClaim({ start, end });
    });
    it("should accept short duration that ends far in the future", async () => {
      const start = add(new Date(), { days: 100 });
      const end = add(start, { days: 1 });
      await addClaim({ start, end });
    });
    it("should accept vesting starting in the past and extending into the future past min future duration.", async () => {
      const start = add(new Date(), { days: -100 });
      const end = add(start, { days: 200 });
      await addClaim({ start, end });
    });
    it("should accept min duration", async () => {
      const start = new Date();
      const end = add(start, { days: 30 });
      await addClaim({ start, end });
    });
    it("should emit a Vested event", async () => {
      const start = new Date();
      const end = add(start, { months: 12 });
      const startSeconds = getUnixTime(start);
      const durationSeconds = getUnixTime(end) - startSeconds;
      const account = account1.address;
      const amountVested = ONE_TOKEN.mul(1000);
      const bonusAmount = ONE_TOKEN.mul(700);
      let expected: any;
      await expect(
        vesting.addClaim(
          account,
          amountVested,
          startSeconds,
          durationSeconds,
          bonusAmount
        )
      )
        .to.emit(vesting, "Vested")
        .withArgs(
          account,
          amountVested,
          startSeconds,
          durationSeconds,
          bonusAmount
        );
    });
  });

  describe("totalsOfAt", async () => {
    it("should return correct future totals for 1 vesting", async () => {
      const start = new Date();
      const claim = await addClaim({
        start,
      });
      const halfTheDuration = claim.durationSeconds / 2;

      const [
        coinsTotal,
        coinsAvailable,
        coinsClaimed,
        bonusesTotal,
        bonusesAvailable,
        bonusesClaimed,
      ] = await vesting.totalsOfAt(
        claim.account,
        claim.startSeconds + halfTheDuration
      );

      expect(coinsTotal).to.eq(claim.amountVested);
      expect(coinsClaimed).to.eq(ZERO);
      expect(coinsAvailable).to.eq(ZERO);
      expect(bonusesTotal).to.eq(claim.bonusAmount);
      expect(bonusesClaimed).to.eq(ZERO);
      expect(bonusesAvailable).to.be.closeTo(
        claim.bonusAmount.div(2),
        ONE_TOKEN
      );
    });
  });

  describe("totalsOf", async () => {
    it("should return correct totals for 1 vesting", async () => {
      const start = new Date();

      const claim = await addClaim({
        start,
      });

      await evmFastForward(Math.floor(claim.durationSeconds / 2));

      const [
        coinsTotal,
        coinsAvailable,
        coinsClaimed,
        bonusesTotal,
        bonusesAvailable,
        bonusesClaimed,
      ] = await vesting.totalsOf(account1.address);

      expect(coinsTotal).to.eq(claim.amountVested);
      expect(coinsClaimed).to.eq(ZERO);
      expect(coinsAvailable).to.eq(ZERO);
      expect(bonusesTotal).to.eq(claim.bonusAmount);
      expect(bonusesClaimed).to.eq(ZERO);
      expect(bonusesAvailable).to.be.closeTo(
        claim.bonusAmount.div(2),
        ONE_TOKEN
      );
    });

    it("should return aggregated totals for multiple vestings", async () => {
      const start1 = new Date();
      const claim1 = await addClaim({
        start: start1,
      });

      const halfTheDuration = Math.floor(claim1.durationSeconds / 2);
      await evmFastForward(halfTheDuration);

      const start2 = add(start1, { seconds: halfTheDuration });

      const claim2 = await addClaim({
        start: start2,
        amountVested: ONE_TOKEN.mul(1500),
      });

      await evmFastForward(halfTheDuration + ONE_HOUR_IN_SECONDS);
      const expectedClaim2BonusAvailableAfterHalfTheDuration =
        claim2.bonusAmount.div(2);

      const [
        coinsTotal,
        coinsAvailable,
        coinsClaimed,
        bonusesTotal,
        bonusesAvailable,
        bonusesClaimed,
      ] = await vesting.totalsOf(account1.address);

      expect(coinsTotal).to.eq(claim1.amountVested.add(claim2.amountVested));
      expect(coinsClaimed).to.eq(ZERO);
      expect(coinsAvailable).to.eq(claim1.amountVested);
      expect(bonusesTotal).to.eq(claim1.bonusAmount.add(claim2.bonusAmount));
      expect(bonusesClaimed).to.eq(ZERO);
      expect(bonusesAvailable).to.be.closeTo(
        claim1.bonusAmount.add(
          expectedClaim2BonusAvailableAfterHalfTheDuration
        ),
        ONE_TOKEN.mul(10)
      );
    });
  });

  describe("claimAll", async () => {
    it("should be denied for non-owner", async () => {
      await addClaim({
        account: account1.address,
      });
      await expect(
        vesting.connect(account1).claimAll(account1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should be denied if paused", async () => {
      await addClaim({});
      await vesting.pause();
      await expect(vesting.claimAll(account1.address)).to.be.revertedWith(
        "Pausable: paused"
      );
    });

    it("should be allowed if unpaused again", async () => {
      await addClaim({});
      await vesting.pause();
      await evmFastForward(ONE_HOUR_IN_SECONDS);
      await vesting.unpause();
      await vesting.claimAll(account1.address);
    });

    it("should revert if there's nothing to claim (vesting period has not started)", async () => {
      const start = add(new Date(), { months: 6 });

      await addClaim({
        account: account1.address,
        start,
      });

      await expect(vesting.claimAll(account1.address)).to.be.revertedWith(
        "ERC20Vesting: Nothing to claim."
      );
    });

    it("should revert if everything is already claimed", async () => {
      const claim = await addClaim({
        account: account1.address,
        bonusAmount: ZERO,
      });
      await evmFastForward(claim.durationSeconds + ONE_HOUR_IN_SECONDS);
      await vesting.claimAll(account1.address);
      await evmFastForward(ONE_HOUR_IN_SECONDS);

      await expect(vesting.claimAll(account1.address)).to.be.revertedWith(
        "ERC20Vesting: Already claimed everything."
      );
    });

    it("should emit AllClaimed event", async () => {
      const claim = await addClaim({
        account: account1.address,
      });

      const thirdOfDuration = Math.floor(claim.durationSeconds / 3);
      const thirdOfBonus = claim.bonusAmount.div(3);
      await evmFastForward(thirdOfDuration);

      await expect(vesting.claimAll(account1.address))
        .to.emit(vesting, "AllClaimed")
        .withArgs(claim.account, (actual: BigNumber) =>
          thirdOfBonus.eq(actual)
        );
    });

    it("should claim only bonuses during vesting period", async () => {
      const start = new Date();

      const claim = await addClaim({
        account: account1.address,
        start,
      });

      const thirdOfDuration = Math.floor(claim.durationSeconds / 3);

      await evmFastForward(thirdOfDuration);
      await vesting.claimAll(account1.address);
      const mundumBalanceAfterClaim = await mundum.balanceOf(account1.address);

      const [
        coinsTotal,
        coinsAvailable,
        coinsClaimed,
        bonusesTotal,
        bonusesAvailable,
        bonusesClaimed,
      ] = await vesting.totalsOf(account1.address);

      const thirdOfBonus = claim.bonusAmount.div(3);
      expect(mundumBalanceAfterClaim).to.be.closeTo(thirdOfBonus, ONE_TOKEN);
      expect(coinsTotal).to.eq(claim.amountVested);
      expect(coinsClaimed).to.eq(ZERO);
      expect(coinsAvailable).to.eq(ZERO);
      expect(bonusesTotal).to.eq(claim.bonusAmount);
      expect(bonusesClaimed).to.be.closeTo(thirdOfBonus, ONE_TOKEN);
      expect(bonusesAvailable).to.be.closeTo(thirdOfBonus, ONE_TOKEN);
    });

    it("should claim only yet unclaimed bonuses during vesting period", async () => {
      const start = new Date();

      const claim = await addClaim({
        account: account1.address,
        start,
      });

      const thirdOfDuration = Math.floor(claim.durationSeconds / 3);

      await evmFastForward(thirdOfDuration);
      await vesting.claimAll(account1.address);
      const mundumBalanceAfterClaim1 = await mundum.balanceOf(account1.address);

      await evmFastForward(thirdOfDuration);
      await vesting.claimAll(account1.address);
      const mundumBalanceAfterClaim2 = await mundum.balanceOf(account1.address);

      const [
        coinsTotal,
        coinsAvailable,
        coinsClaimed,
        bonusesTotal,
        bonusesAvailable,
        bonusesClaimed,
      ] = await vesting.totalsOf(account1.address);

      const thirdOfBonus = claim.bonusAmount.div(3);
      const twoThirdsOfBonus = claim.bonusAmount.mul(2).div(3);
      expect(mundumBalanceAfterClaim1).to.be.closeTo(thirdOfBonus, ONE_TOKEN);
      expect(mundumBalanceAfterClaim2).to.be.closeTo(
        twoThirdsOfBonus,
        ONE_TOKEN
      );
      expect(coinsTotal).to.eq(claim.amountVested);
      expect(coinsClaimed).to.eq(ZERO);
      expect(coinsAvailable).to.eq(ZERO);
      expect(bonusesTotal).to.eq(claim.bonusAmount);
      expect(bonusesClaimed).to.be.closeTo(twoThirdsOfBonus, ONE_TOKEN);
      expect(bonusesAvailable).to.be.closeTo(twoThirdsOfBonus, ONE_TOKEN);
    });

    it("should claim unclaimed bonuses and coins after vesting period", async () => {
      const start = new Date();

      const claim = await addClaim({
        account: account1.address,
        start,
      });

      const thirdOfDuration = Math.floor(claim.durationSeconds / 3);

      await evmFastForward(thirdOfDuration);
      await vesting.claimAll(account1.address);

      await evmFastForward(claim.durationSeconds);
      await vesting.claimAll(account1.address);
      const mundumBalanceAfterFinalClaim = await mundum.balanceOf(
        account1.address
      );

      const [
        coinsTotal,
        coinsAvailable,
        coinsClaimed,
        bonusesTotal,
        bonusesAvailable,
        bonusesClaimed,
      ] = await vesting.totalsOf(account1.address);

      expect(mundumBalanceAfterFinalClaim).to.eq(
        claim.amountVested.add(claim.bonusAmount)
      );
      expect(coinsTotal).to.eq(claim.amountVested);
      expect(coinsClaimed).to.eq(claim.amountVested);
      expect(coinsAvailable).to.eq(claim.amountVested);
      expect(bonusesTotal).to.eq(claim.bonusAmount);
      expect(bonusesClaimed).to.eq(claim.bonusAmount);
      expect(bonusesAvailable).to.eq(claim.bonusAmount);
    });
  });

  it("should claim everything after vesting period if no claims have been made before", async () => {
    const claim = await addClaim({
      account: account1.address,
    });

    await evmFastForward(claim.durationSeconds + ONE_HOUR_IN_SECONDS);
    await vesting.claimAll(account1.address);

    const mundumBalanceAfterClaim = await mundum.balanceOf(account1.address);

    expect(mundumBalanceAfterClaim).to.eq(
      claim.amountVested.add(claim.bonusAmount)
    );
  });
  /* test cases:
    
    low: - time negative
    */
});
