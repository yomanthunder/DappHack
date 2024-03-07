const { ethers } = require("hardhat");
const { expect } = require("chai");
const { anyValue, withArgs } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { describe } = require("mocha");

//const { Result } = require("ethers");

async function deployContract() {
    const tester1 = new ethers.Wallet(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        ethers.provider
    );
    const tester2 = new ethers.Wallet(
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        ethers.provider
    );
    const tester3 = new ethers.Wallet(
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        ethers.provider
    );
    const tester4 = new ethers.Wallet(
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
        ethers.provider
    );
    const spon = new ethers.Wallet(
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
        ethers.provider
    );
    const tester1WithProvider = await ethers.provider.getSigner(tester1.address);
    const tester2WithProvider = await ethers.provider.getSigner(tester2.address);
    const tester3WithProvider = await ethers.provider.getSigner(tester3.address);
    const tester4WithProvider = await ethers.provider.getSigner(tester4.address);
    const sponWithProvider = await ethers.provider.getSigner(spon.address);


    const startTime = 0; // Replace with your desired start time
    const endTime = 163; // Replace with your desired end time
    const maxParticipants = 100; // Replace with your desired maximum number of participants
    const teamSizeLimit = 5; // Replace with your desired maximum team size
    const organizers = [tester1.address,spon.address]; // Replace with your desired organizer addresses
    const name = "My Project NFT"; // Replace with your desired project NFT name
    const symbol = "MPN"; // Replace with your desired project NFT symbol

    const dappHackFactory = await hre.ethers.getContractFactory("DappHack");
    const dappHack = await dappHackFactory
        .connect(tester1WithProvider)
        .deploy(
            startTime,
            endTime,
            maxParticipants,
            teamSizeLimit,
            organizers,
            name,
            symbol
        );
    return [dappHack, tester1WithProvider, sponWithProvider, tester2WithProvider, tester3WithProvider, tester4WithProvider, spon, tester1, tester2, tester3, tester4];
}

describe("Testing Parent Contract Functions", function () {
    let dappHack, tester1WithProvider, sponWithProvider, tester2WithProvider, tester3WithProvider, tester4WithProvider, spon, tester1, tester2, tester3, tester4;

    beforeEach(async function () {
        [dappHack, tester1WithProvider, sponWithProvider, tester2WithProvider, tester3WithProvider, tester4WithProvider, spon, tester1, tester2, tester3, tester4] = await deployContract();

        // Sponsor Signup
        // Assuming your contract has a method to sign up sponsors
        await dappHack.connect(tester1WithProvider).sponsorSignup("First guy", [tester1.address], [400, 200, 100], 100, 1, {
            value: ethers.parseEther("0.0000000000000008")
        });
        await dappHack.connect(tester2WithProvider).sponsorSignup("Second guy", [spon.address], [400, 200, 100], 200, 1, {
            value: ethers.parseEther("0.0000000000000009")
        });
        await dappHack.connect(tester3WithProvider).sponsorSignup("Third guy", [tester2.address], [400, 200, 100], 300, 1, {
            value: ethers.parseEther("0.0000000000000010")
        });
        await dappHack.connect(tester4WithProvider).sponsorSignup("Fourth guy", [tester3.address], [400, 200, 100], 400, 1, {
            value: ethers.parseEther("0.0000000000000011")
        });
        //signup builders to the hackathon
        await dappHack.connect(tester1WithProvider).builderSignup({ value: ethers.parseEther("0.01") });
        // await dappHack.connect(tester2WithProvider).builderSignup({ value: ethers.parseEther("0.01") });
        await dappHack.connect(tester3WithProvider).builderSignup({ value: ethers.parseEther("0.01") });
        await dappHack.connect(tester4WithProvider).builderSignup({ value: ethers.parseEther("0.01") });


    });
    
    it("Unit test for withdrawBuilder function", async function () {
        await expect(dappHack.connect(tester3WithProvider).withdrawBuilder()).to.emit(dappHack, "BuilderWithdrawn").withArgs(tester3.address);
    });

    it("Unit test for initialise team ,changeteam and withdrawTeam functionality", async function () {

        const teamName1 = "Team 1";
        const teamMembers1 = [tester2.address, tester3.address];
        await expect(dappHack.connect(tester3WithProvider).initializeTeam(teamName1, teamMembers1)).to.emit(dappHack, "TeamInitialized").withArgs(teamName1, teamMembers1);

        const teamName2 = "Team 2";
        const teamMembers2 = [tester4.address];
        await expect(dappHack.connect(tester4WithProvider).initializeTeam(teamName2, teamMembers2)).to.emit(dappHack, "TeamInitialized").withArgs(teamName2, teamMembers2);


        const duplicateTeamName = "Duplicate Team";
        const duplicateTeamMembers = [tester2.address];
        await expect(dappHack.connect(sponWithProvider).initializeTeam(duplicateTeamName, duplicateTeamMembers))
            .to.be.revertedWith("participants already in team");

        // checking the updated map data 
        const getTeamName = await dappHack.getTeamName(0);
        expect(getTeamName).to.equal(teamName1);
        const getTeamName2 = await dappHack.getTeamName(1);
        expect(getTeamName2).to.equal(teamName2);
        const getTeamSize = await dappHack.getTeamSize(0);
        const getTeamSize2 = await dappHack.getTeamSize(1);
        expect(getTeamSize).to.equal(2);
        expect(getTeamSize2).to.equal(1);

        // check whether participants are added
        const getTeamParticipantAddress1 = await dappHack.getTeamParticipantAddress(0, 0);
        expect(getTeamParticipantAddress1).to.deep.equal(teamMembers1[0]);
        const getTeamParticipantAddress2 = await dappHack.getTeamParticipantAddress(0, 1);
        expect(getTeamParticipantAddress2).to.deep.equal(teamMembers1[1]);
        const getTeamParticipantAddress3 = await dappHack.getTeamParticipantAddress(1, 0);
        expect(getTeamParticipantAddress3).to.deep.equal(teamMembers2[0]);

        // testing changeTeam

        const changeTeam = await dappHack.connect(tester3WithProvider).changeTeam(0, 1);
        await expect(changeTeam).to.emit(dappHack, "TeamChanged").withArgs(0, 1); // changing team from 0 to 1

        // testing withdrawTeam
        const withdrawTeam = await dappHack.connect(tester3WithProvider).withdrawTeam();
        await expect(withdrawTeam).to.emit(dappHack, "TeamWithdrawn").withArgs(1, tester3.address);
        // checking the updated map data 
        const getTeamName3 = await dappHack.getTeamName(1);
        expect(getTeamName3).to.equal(teamName2);
        const getTeamSize3 = await dappHack.getTeamSize(1);
        expect(getTeamSize3).to.equal(1); // team size changes from 2 to 1 due to withdraw 
    });
    it("unit test of submitProject", async function () {
        // initialising a Teams 
        const teamName1 = "Team 1";
        const teamMembers1 = [tester2.address, tester3.address];
        await expect(dappHack.connect(tester3WithProvider).initializeTeam(teamName1, teamMembers1)).to.emit(dappHack, "TeamInitialized").withArgs(teamName1, teamMembers1);

        const teamName2 = "Team 2";
        const teamMembers2 = [tester4.address];
        await expect(dappHack.connect(tester4WithProvider).initializeTeam(teamName2, teamMembers2)).to.emit(dappHack, "TeamInitialized").withArgs(teamName2, teamMembers2);

        // project submission
        const submittedProject1 = await dappHack.connect(tester3WithProvider).submitProject(0, "Dapp");
        await expect(submittedProject1).to.emit(dappHack, "ProjectSubmitted").withArgs(0, "Dapp");
        const submittedProject2 = await dappHack.connect(tester4WithProvider).submitProject(1, "Dapp1");
        await expect(submittedProject2).to.emit(dappHack, "ProjectSubmitted").withArgs(1, "Dapp1");


        // checking the updated map data 
        const getProjectName = await dappHack.getTeamProject(0);
        expect(getProjectName).to.equal(true);
        const getProjectName2 = await dappHack.getTeamProject(1);
        expect(getProjectName2).to.equal(true);

        // dummy submission
        // for some reason to.be.reverted is not working properly (test is working but the error message is getting printed) 
        // const submittedProject3 = await dappHack.connect(tester3WithProvider).submitProject(0, "Dapp3");
        // await expect(submittedProject3).to.be.reverted;

       
    })
    it("unit test of judgeWinner function", async function () {
        await dappHack.connect(tester2WithProvider).judgeWinner("Xero", [1,2,3], [0]);
        const winnerCount = await dappHack.getWinnerCount();
        expect(winnerCount).to.equal(1);
    })
    
    it("Unit Tests for returnStake function and transferNFTAfterHackathon", async function () {
        const teamName1 = "Team 1";
        const teamMembers1 = [tester2.address, tester3.address];
        await expect(dappHack.connect(tester3WithProvider).initializeTeam(teamName1, teamMembers1)).to.emit(dappHack, "TeamInitialized").withArgs(teamName1, teamMembers1);

        const teamName2 = "Team 2";
        const teamMembers2 = [tester4.address];
        await expect(dappHack.connect(tester4WithProvider).initializeTeam(teamName2, teamMembers2)).to.emit(dappHack, "TeamInitialized").withArgs(teamName2, teamMembers2);

        // project submission
        const submittedProject1 = await dappHack.connect(tester3WithProvider).submitProject(0, "Dapp");
        await expect(submittedProject1).to.emit(dappHack, "ProjectSubmitted").withArgs(0, "Dapp");
        const submittedProject2 = await dappHack.connect(tester4WithProvider).submitProject(1, "Dapp1");
        await expect(submittedProject2).to.emit(dappHack, "ProjectSubmitted").withArgs(1, "Dapp1");
        //balance before returning stake
        const balance = await dappHack.connect(tester2WithProvider).getBalance();
        // returning stake to submitted projects 
        await dappHack.connect(sponWithProvider).returnStake();
        // balance after returning stake
        const balance2 = await dappHack.getBalance();
        // total 3 members will get there stake back (as these were the 2 teams which have submitted a project)
        const a = balance-balance2;
        expect(a).to.equal(3000000000000000);
        //Transfer nft after hackathon
        // internal function cant be tested here
        // await dappHack.connect(sponWithProvider).transferNFTAfterHackathon(0);
        
    })

});
describe("Testing calculatePoolPrizeChangePayment", function () {
    let dappHack, tester1WithProvider, sponWithProvider, tester2WithProvider, tester3WithProvider, tester4WithProvider, spon, tester1, tester2, tester3, tester4;

    beforeEach(async function () {
        [dappHack, tester1WithProvider, sponWithProvider, tester2WithProvider, tester3WithProvider, tester4WithProvider, spon, tester1, tester2, tester3, tester4] = await deployContract();

        // Assuming your contract has a method to sign up sponsors
        await dappHack.connect(tester1WithProvider).sponsorSignup("First guy", [tester1.address], [400,  200,  100],  100,  1, {
            value: ethers.parseEther("0.0000000000000008")
        });
        await dappHack.connect(tester2WithProvider).sponsorSignup("Second guy", [tester2.address,spon.address], [400,  200,  100],  200,  1, {
            value: ethers.parseEther("0.0000000000000009")
        });
        await dappHack.connect(tester3WithProvider).sponsorSignup("Third guy", [tester3.address], [400,  200,  100],  300,  1, {
            value: ethers.parseEther("0.0000000000000010")
        });
    });

    it("Unit test of calculatePoolPrizeChangePayment and changePrizePool", async function () {
        // testing calculatePoolPrizeChangePayment
        const calculatePoolPrizeChangePayment1 = await dappHack.connect(tester2WithProvider).calculatePoolPrizeChangePayment(100);
        expect(calculatePoolPrizeChangePayment1).to.equal(-100);

        const calculatePoolPrizeChangePayment2 = await dappHack.connect(tester2WithProvider).calculatePoolPrizeChangePayment(400);
        expect(calculatePoolPrizeChangePayment2).to.equal(200);

        // testing changePrizePool
        const beforegetSponsorPrizePool = await dappHack.connect(tester2WithProvider).getSponsorPrizePool(1);
         expect(beforegetSponsorPrizePool).to.equal(200);
        // getting balances before changing
        const balance1 = await dappHack.connect(tester2WithProvider).getBalance()
        await expect(dappHack.connect(tester2WithProvider).changePrizePool(100))
        .to.emit(dappHack, "PrizePoolChanged")
        .withArgs(tester2.address, beforegetSponsorPrizePool , 100);
        const aftergetSponsorPrizePool = await dappHack.connect(tester3WithProvider).getSponsorPrizePool(1);
        expect(aftergetSponsorPrizePool).to.equal(100);
        // getting balances after changing
        const balance2 = await dappHack.connect(tester3WithProvider).getBalance()
        expect(balance2 - balance1).to.equal(-100);
        
    });
    it("Unit test of calculate of calculatePrizeArrayChangePayment and changePrizeArray", async function(){
        // testing calculatePrizeArrayChangePayment
        const calculatePrizeArrayChangePayment1 = await dappHack.connect(tester3WithProvider).calculatePrizeArrayChangePayment([500 , 400 , 300]);
        expect(calculatePrizeArrayChangePayment1).to.equal(500);
        

        const calculatePrizeArrayChangePayment2 = await dappHack.connect(tester3WithProvider).calculatePrizeArrayChangePayment([300, 200, 100]);
        expect(calculatePrizeArrayChangePayment2).to.equal(-100);

        // testing changePrizeArray
        const beforegetSponsorPrizeArray = await dappHack.connect(tester3WithProvider).getSponsorPrizeArray();
        // balance before making change
        const balance1 = await dappHack.connect(tester3WithProvider).getBalance()
        // need to send eth when you setting prize array greater than the before msg.value
        expect(beforegetSponsorPrizeArray).to.deep.equal([400, 200, 100]);
        await expect(dappHack.connect(tester3WithProvider).changePrizeArray([500 , 400 , 300], {value: ethers.parseEther("0.0000000000000010")}))
        .to.emit(dappHack, "PrizeArrayChanged")
        .withArgs(tester3.address, beforegetSponsorPrizeArray , [500 , 400 , 300]);
        // balance after making first change
        const balance2 = await dappHack.connect(tester3WithProvider).getBalance()
        expect(balance2 - balance1).to.equal(1000);
        const aftergetSponsorPrizeArray = await dappHack.connect(tester3WithProvider).getSponsorPrizeArray();
        
        expect(aftergetSponsorPrizeArray).to.deep.equal([500 , 400 , 300]);
        // no need send eth when you are sending less prize array campared to before 
        await expect(dappHack.connect(tester3WithProvider).changePrizeArray([300 , 200 , 100]))
        .to.emit(dappHack, "PrizeArrayChanged")
        .withArgs(tester3.address, [500 , 400 , 300] , [300 , 200 , 100]);
        // balance after making second change
        const balance3 = await dappHack.connect(tester3WithProvider).getBalance()
        expect(balance3 - balance2).to.equal(-600);
    })
});
