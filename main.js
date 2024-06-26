let WALLET_CONNECTED = "";
let contractAddress = "0x241f69F8991a1B6C0132Ea83bFD9c753a9971D7a";
let contractAbi = [
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "_candidateNames",
        "type": "string[]"
      },
      {
        "internalType": "uint256",
        "name": "_durationInMinutes",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllVotesOfCandiates",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Voting.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRemainingTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "_candidateNames",
        "type": "string[]"
      },
      {
        "internalType": "uint256",
        "name": "_durationInMinutes",
        "type": "uint256"
      }
    ],
    "name": "startElection",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateIndex",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingEnd",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingStart",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const connectMetamask = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  WALLET_CONNECTED = await signer.getAddress();
  var element = document.getElementById("metamaskbtn");
  element.style.backgroundColor = "green";
  element.innerHTML = "Metamask is connected " + WALLET_CONNECTED;
}

const addVote = async () => {
  if (WALLET_CONNECTED != 0) {
    var name = document.getElementById("vote");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    var cand = document.getElementById("cand");
    const hasVoted = await contractInstance.voters(WALLET_CONNECTED);
    if (!hasVoted) {
      cand.innerHTML = "Please wait, adding a vote in the smart contract";
      const tx = await contractInstance.vote(name.value);
      await tx.wait();
      cand.innerHTML = "Vote added !!!";
    } else {
      cand.innerHTML = "You voted already";
    }

  }
  else {
    var cand = document.getElementById("cand");
    cand.innerHTML = "Please connect metamask first";
  }
}

const voteStatus = async () => {
  if (WALLET_CONNECTED != 0) {
    var status = document.getElementById("status");
    var remainingTime = document.getElementById("time");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    const currentStatus = await contractInstance.getVotingStatus();
    const time = await contractInstance.getRemainingTime();
    console.log(time);
    status.innerHTML = currentStatus == 1 ? "Voting is currently open" : "Voting is finished";
    const seconds = parseInt(time, 16);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = seconds % 60;
    remainingTime.innerHTML = `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${secondsRemaining.toString().padStart(2, '0')}s`;
  }
  else {
    var status = document.getElementById("status");
    status.innerHTML = "Please connect metamask first";
  }
}

const getAllCandidates = async () => {
  if (WALLET_CONNECTED != 0) {

    var p3 = document.getElementById("p3");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    p3.innerHTML = "Please wait, getting all the candidates from the voting smart contract";
    var candidates = await contractInstance.getAllVotesOfCandiates();
    console.log(candidates);
    var table = document.getElementById("myTable");
    table.tBodies[0].innerHTML = ''
    for (let i = 0; i < candidates.length; i++) {
      var row = table.insertRow();
      var idCell = row.insertCell();
      var descCell = row.insertCell();
      var statusCell = row.insertCell();

      idCell.innerHTML = i + 1;
      descCell.innerHTML = candidates[i].name;
      statusCell.innerHTML = candidates[i].voteCount;
    }

    p3.innerHTML = "The tasks are updated"
  }
  else {
    var p3 = document.getElementById("p3");
    p3.innerHTML = "Please connect metamask first";
  }
}


const getAllCandidatesIndexPage = async() => {

  //var p3i = document.getElementById("p3Index");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
  //p3i .innerHTML = "Please wait, getting all the candidates from the voting smart contract";
  var candidates = await contractInstance.getAllVotesOfCandiates();
  console.log(candidates);
  var table = document.getElementById("myTableIndex");

  for (let i = 0; i < candidates.length; i++) {
    var row = table.insertRow();
    var idCell = row.insertCell();
    var descCell = row.insertCell();
    var statusCell = row.insertCell();

    idCell.innerHTML = i + 1;
    descCell.innerHTML = candidates[i].name;
    //statusCell.innerHTML = await getVoteByPlayer(contractInstance, i);

    // Create a Vote button
    const voteButton = document.createElement("button");
    voteButton.innerHTML = "Vote";
    voteButton.style.backgroundColor = "#2196f3";
    voteButton.style.color = "white";
    voteButton.style.padding = "5px 10px";
    voteButton.style.borderRadius = "5px";
    voteButton.style.cursor = "pointer";
    voteButton.style.border = "none";
    voteButton.style.outline = "none";
    voteButton.onclick = async () => {
      await addVoteEach(contractInstance, i);
    };
    statusCell.appendChild(voteButton);
  }

  //p3i.innerHTML = "The tasks are updated"
}

const addVoteEach = async(contractInstance, candidateIndex) => {


  if (WALLET_CONNECTED != 0) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    var cand = document.getElementById("cand");
    const hasVoted = await contractInstance.voters(WALLET_CONNECTED);
    if (!hasVoted) {
      cand.innerHTML = "Please wait, adding a vote in the smart contract";
      const tx = await contractInstance.vote(candidateIndex);
      await tx.wait();
      cand.innerHTML = "Vote added !!!";
    } else {
      cand.innerHTML = "You voted already";
    }

  }
  else {
    var cand = document.getElementById("cand");
    cand.innerHTML = "Please connect metamask first";
  }
}
