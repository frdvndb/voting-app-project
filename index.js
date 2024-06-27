require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        extended: true
    })
)
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const ethers = require('ethers');

var port = 3000;

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const { abi } = require('./artifacts/contracts/Voting.sol/Voting.json');
const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

// app.get("/ListVoters.html", (req, res) => {
//     res.sendFile(path.join(__dirname, "ListVoters.html"));
// })

app.post("/vote", async (req, res) => {
    var vote = req.body.vote;
    console.log(vote)
    async function storeDataInBlockchain(vote) {
        console.log("Adding the candidate in voting contract...");
        const tx = await contractInstance.addCandidate(vote);
        await tx.wait();
    }
    const bool = await contractInstance.getVotingStatus();
    if (bool == true) {
        await storeDataInBlockchain(vote);
        //res.send("The candidate has been registered in the smart contract");
        res.sendFile(path.join(__dirname, 'success.html')); // Send the success.html file
    }
    else {
        res.send("Voting is finished");
    }
});


app.post("/startvote", async (req, res) => {
    const candidates = req.body.candidates;
    console.log(candidates);
    const electionDuration = req.body.electionDuration;
    console.log(electionDuration);
  
    if (!candidates) {
      res.send("List of candidates is empty!");
      return;
    }
  
    if (!electionDuration) {
      res.send("Please set the election duration");
      return;
    }
  
    const _candidates = candidates.split(",");
    const _votingDuration = parseInt(electionDuration);
  
    try {
      // Estimate gas limit
      const estimatedGas = await contractInstance.estimateGas.startElection(_candidates, _votingDuration);
      console.log("Estimated Gas:", estimatedGas);
  
      // Get gas price
      const gasPrice = await provider.getGasPrice();
      console.log("Gas Price:", gasPrice.toString());
  
      // Set a higher gas limit manually
      const manualGasLimit = 7000000;
  
      // Start the election with the manual gas limit and current gas price
      const tx = await contractInstance.startElection(_candidates, _votingDuration, {
        gasLimit: manualGasLimit,
        gasPrice: gasPrice,
      });
      console.log("Transaction:", tx);
  
      await tx.wait();
      res.send("The voting process has been started");
    } catch (error) {
      console.error("Error starting the voting:", error);
      res.send("Error starting the voting. Check the console for more details.");
    }
  });


app.listen(port, function () {
    console.log("App is listening on port 3000")
});