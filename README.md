## Mystos — Privacy-First AI Wallet & DAO Voting dApp

A mobile wallet where users control an AI assistant that performs DAO operations privately using Zero-Knowledge Proofs.

## 🚀 Overview

Mystos is a next-generation decentralized wallet built for privacy, security, and governance.
It combines:
1. Self-custody wallet (12-word seed, unique to each user)
2. Local AI chatbot (summarizes DAO proposals, explains votes)
3. Zero-Knowledge voting (Midnight)
4. DAO participation with complete user anonymity
5. Transaction rating & reputation system
Mystos ensures your data never leaves your device, and only encrypted metadata or hashes are written to the blockchain.

## 🧠 Core Features

🔑 1. Wallet Creation / Import
1. Create a new wallet with a unique 12-word seed phrase
2. Import an existing wallet by entering the 12-word phrase
3. Secure storage using device hardware encryption
4. Automatic generation of a Decentralized Identity (DID)

🏠 2. Home Dashboard
1. Shows total portfolio value with hide/unhide
2. Lists popular tokens: BTC, ETH, SOL, USDT
3. Quick actions:
  - Send
  - Receive
  - Swap
  - Withdraw
  - Support

🤖 3. AI Chatbot (Local, Private)
1. The Mystos AI agent lives on your device:
2. Summarizes DAO proposals
3. Explains pros/cons and risks
4. Helps decide how to vote
5. Sends confidential messages without uploading user data
6. Generates ZK-compatible vote summaries

🗳️ 4. DAO Voting via ZK Proofs
1. Mystos integrates with Cardano Midnight (or mocked ZKP for demo):
2. AI prepares vote metadata
3. User approves vote
4. Device generates Zero-Knowledge Proof (ZKP)
5. Submit vote anonymously
6. No wallet address or private info is revealed

⭐ 5. Transaction Rating & Reputation
1. After every send, swap, or vote:
2. User gives stars + comment
3. Ratings affect trust recommendations in the AI assistant

⚙️ 6. Settings Menu
(Accessible from the top-left menu)
  - Profile
  - Settings
  - Change Theme
  - Push Notifications
  - Transaction History
  - Help & Support
  - Logout

## 🏛️ Tech Stack
1. Frontend - React, Tailwind / styled components
2. Backend - Node.js, Express, JWT auth (nonce + signature), In-memory proposal list, Mock vote submission endpoint
3. Midnight ZKP (or mock proof generator for demo)

## 🧪 Core Flow
1. App Launch
  - Check if wallet exists
  - Show Create / Import screen
2. Wallet Setup
  - Generate/import seed
  - Generate DID
  - Authenticate using backend nonce
3. Home
  - Show balance
  - Token list
  - Quick actions
4. Chatbot
  - Fetch proposals → summarize → ask questions
  - Begin vote flow
5. ZKP Vote
  - Prepare payload
  - Generate proof
  - Submit
  - Show confirmation
6. Rate Action
  - Stars + comment
  - Reputation updated locally

## 🧩 Backend APIs (Demo)
Endpoint	      Method	Purpose
/nonce	         GET  	generate authentication nonce
/verify	         POST	  verify signature & issue token
/proposals	     GET	  list DAO proposals
/submit-vote	  POST	  accept vote payload (mock txHash)

## 🔒 Security Highlights
 
Mnemonic & DID stored in secure hardware enclave
All AI/ML and proposal analysis runs on-device
ZKPs generated locally (mock for hackathon)
No PII or conversation logs stored on the server
Blockchain stores only hashed metadata

## 🛠️ Installation
Start Backend
```
cd server
npm install
node server.js
```
Start App
```
cd app
npm install
npm start
```
Open Web App

## 🎥 Demo Script (90 seconds)
  - Create wallet (12-word seed)
  - Home dashboard → hide/unhide balance
  - Select ETH → open coin detail
  - Open AI → summarize proposal
  - Vote → generate mock ZKP → submit
  - Show confirmation
  - Rate transaction → reputation updates

## 🏁 Final Note
Mystos is built to show how privacy, AI, and self-custody can work together.
Nothing leaves your device unless you approve it — and even then, it’s encrypted or hashed.
