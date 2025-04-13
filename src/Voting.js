import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const VotingApp = () => {
  const [candidates, setCandidates] = useState([]);
  const [account, setAccount] = useState(null);
  const [candidatesCount, setCandidatesCount] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const abi = [
       {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
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
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
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
      "name": "candidatesCount",
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
      "name": "getResults",
      "outputs": [
        {
          "internalType": "string",
          "name": "winnerName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "winnerVoteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_candidateId",
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
    }
  ];
  const contract = new ethers.Contract(contractAddress, abi, provider);

  // Connexion à MetaMask pour obtenir l'adresse de l'utilisateur
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
  
          await getCandidates(); // 👈 afficher les candidats dès que l'utilisateur est connecté
        } catch (error) {
          console.error("Erreur lors de la connexion à MetaMask :", error);
        }
      } else {
        alert("MetaMask n'est pas installé.");
      }
    };
  
    init();
  }, []);
  

  // Récupérer le nombre de candidats et les détails
  const getCandidates = async () => {
    setLoading(true);
    const count = await contract.candidatesCount();
    setCandidatesCount(count.toString());

    // Récupérer les candidats un par un
    let candidatesList = [];
    for (let i = 1; i <= count; i++) {
      const candidate = await contract.candidates(i);
      candidatesList.push(candidate);
    }    
    setCandidates(candidatesList);
    setLoading(false);
  };

  // Fonction pour voter pour un candidat
 const voteForCandidate = async (candidateId) => {
  if (!account) {
    alert("Veuillez vous connecter avec MetaMask.");
    return;
  }

  try {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    console.log("Compte connecté :", account);
    console.log("ID du candidat :", candidateId);

    const tx = await contractWithSigner.vote(candidateId);
    await tx.wait();

    alert(`Vous avez voté pour le candidat ${candidateId} !`);
    getCandidates(); // Recharger la liste mise à jour
  } catch (error) {
    console.error("Erreur de vote:", error);

    // ✅ Afficher une erreur lisible :
    alert("Erreur : " + (error?.reason || error?.message || JSON.stringify(error)));
  }
};


return (
  <div>
    <h1>Bienvenue dans l'application de vote</h1>
    {account ? (
      <div>
        <p>Connecté avec: {account}</p>
        
        {/* Affichage direct de la liste des candidats après la connexion */}
        {loading ? <p>Chargement...</p> : (
          <div>
            {candidatesCount && <p>Nombre de candidats: {candidatesCount}</p>}
            {candidates.length > 0 ? (
              <ul>
                {candidates.map((candidate, index) => (
                  <li key={index}>
                    <p>Nom: {candidate.name}</p>
                    <p>Nombre de votes: {candidate.voteCount.toString()}</p>
                    <button onClick={() => voteForCandidate(candidate.id.toString())}>
                      Voter pour ce candidat
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun candidat trouvé.</p>
            )}
          </div>
        )}
      </div>
    ) : (
      <p>Veuillez vous connecter avec MetaMask.</p>
    )}
  </div>
);
}
export default VotingApp;
