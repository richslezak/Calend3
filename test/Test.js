const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("calend3", function () {
  let Contract, contract;
  let owner, addr1, addr2;

  // beforeEach will run before each test
  beforeEach(async function () {
    // get addresses
    [owner, addr1, addr2] = await ethers.getSigners();

    Contract = await ethers.getContractFactory("Calend3");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  it("Should set the minutely rate", async function () {
    const tx = await contract.setRate(1000);

    // wait until txn is mined
    await tx.wait();

    // verify that rate is set correctly
    expect(await contract.getRate()).to.equal(1000);
  });

  it("should fail if non-owner sets the rate", async function () {
    // Call set rate using a different account address
    // This should fail since the address is not the owner
    await expect(contract.connect(addr1).setRate(500)).to.be.revertedWith(
      "Only the owner can set the rate"
    );
  });

  it("Should create two appointments", async function () {
    const tx1 = await contract.setRate(ethers.utils.parseEther("0.001"));
    await tx1.wait();

    const tx2 = await contract
      .connect(addr1)
      .createAppointment("Meet with Rich", 1644143400, 1644150600, {
        value: ethers.utils.parseEther("0.5"),
      });
    await tx2.wait();

    const tx3 = await contract
      .connect(addr2)
      .createAppointment("Mint the new NFT", 1644154200, 1644159600, {
        value: ethers.utils.parseEther("0.5"),
      });
    await tx3.wait();

    const appointments = await contract.getAppointments();

    expect(appointments.length).to.equal(2);

    const ownerBallance = await ethers.provider.getBalance(owner.address);
    const addr1Ballance = await ethers.provider.getBalance(addr1.address);
    const addr2Ballance = await ethers.provider.getBalance(addr2.address);

    console.log(ownerBallance);
    console.log(addr1Ballance);
    console.log(addr2Ballance);

    console.log(appointments[0].ammountPaid);
    console.log(appointments[1].ammountPaid);
  });
});
