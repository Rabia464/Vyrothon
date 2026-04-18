# CipherStack – Node-Based Cascade Encryption Builder

## Project Overview
CipherStack is a node-based encryption system where users create a pipeline of multiple cipher algorithms. Each node applies a cipher, and data flows sequentially through the pipeline for both encryption and decryption.

The system ensures that encrypted data can be perfectly reversed back to its original form using the same pipeline in reverse order.

---

## Features

- Node-based encryption pipeline
- Add, remove, and reorder cipher nodes
- Supports encryption and decryption modes
- Multiple cipher support:
  - Caesar Cipher
  - XOR Cipher
  - Vigenère Cipher
  - Optional: Base64, Reverse String, Rail Fence
- Intermediate output displayed at each node
- Perfect round-trip encryption (Encrypt → Decrypt = Original text)
- Export and import pipeline configuration (JSON)
- Copy final output functionality

---

## Tech Stack

- React (Vite)
- React Flow (Node-based UI)
- JavaScript (ES6+)
- Tailwind CSS

---

## Project Structure
