<div align="center">

  <img src="credify.svg" width="140" height="140" alt="Credify Logo" />

  # Credify

  **Cryptographic Academic Credential Issuance and Zero-Trust Verification Infrastructure**

  A production-grade public key infrastructure (PKI) designed to eliminate academic credential forgery through asymmetric cryptography, canonical hashing, and multi-modal zero-trust verification.

</div>

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Core Architecture & Cryptographic Primitives](#core-architecture--cryptographic-primitives)
- [System Workflows](#system-workflows)
- [Verification Methods](#verification-methods)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Security & Threat Model](#security--threat-model)

---

## Overview

Credify is a zero-trust credential infrastructure that enables universities, autonomous colleges, and certifying organizations to issue cryptographically signed, unforgeable academic degrees, transcripts, and certificates.

Unlike traditional paper degrees or vulnerable digital PDFs that can be altered in standard PDF editors, credentials issued via Credify contain mathematical cryptographic signatures bound to an institution's public root identity. Anyone (recruiters, universities, background verification agencies) can verify credential provenance and authenticity in sub-second latency without requiring direct database integration or administrative access.

---

## The Problem

Traditional educational verification models suffer from severe structural vulnerabilities:

1. **Rampant Document Forgery:** Standard PDF and paper documents can be visually fabricated or modified (altering CGPA, names, degree conferrals) in minutes using desktop software.
2. **Slow, Opaque Background Checks:** Conventional verification requires manual email exchanges, postal transcripts, or third-party background screening firms, taking 2 to 4 weeks per candidate.
3. **Siloed Databases:** National repositories often exclude autonomous colleges, bootcamps, and hackathons, and lack open, machine-readable REST interfaces for international recruiters.
4. **Centralized Key Compromise Risks:** Systems that store issuing authority private keys in centralized databases create catastrophic single points of failure.

Credify solves these challenges by combining public key cryptography with a zero-knowledge architectural model where private keys never leave the issuing authority's custody.

---

## Core Architecture & Cryptographic Primitives

Credify implements a decentralized PKI model that supports three distinct asymmetric cryptographic standards, allowing institutions to balance signature size, signing latency, and enterprise compliance:

### 1. Ed25519 (Edwards-curve Digital Signature Algorithm)
- **Curve:** Curve25519 (RFC 8032)
- **Signature Size:** 64 bytes (compact representation)
- **Key Characteristics:** Sub-millisecond signing and verification speeds with constant-time execution to prevent side-channel timing attacks. Highly optimized for high-density QR code embedding.

### 2. ECC P-256 (ECDSA over NIST P-256)
- **Curve:** secp256r1 (FIPS 186-4)
- **Signature Size:** 70–72 bytes (DER-encoded ASN.1)
- **Key Characteristics:** Conforms to banking, government, and NIST enterprise compliance standards.

### 3. RSA-2048 (PKCS#1 v1.5 with SHA-256)
- **Modulus Size:** 2048-bit prime factor modulus
- **Signature Size:** 256 bytes
- **Key Characteristics:** Broad compatibility with legacy enterprise PKI frameworks.

### Canonical Data Hashing
Before signing, credential payloads are converted to a deterministic, canonical JSON representation and hashed using SHA-256:

$$\text{DataHash} = \text{SHA-256}(\text{CanonicalJSON}(\text{studentName}, \text{rollNo}, \text{degree}, \text{cgpa}, \text{issueDate}, \text{institutionId}))$$

This ensures that any modification to a single character or numeric grade irreversibly invalidates the cryptographic signature.

---

## System Workflows

```
+-----------------------------------------------------------------------------------+
| 1. Authority Registration                                                         |
|    Admin signs in via Clerk -> Selects Algorithm -> Root Keypair Generated        |
|    Public Key saved to DB   -> Private Key delivered securely to Admin (Not in DB)|
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. Credential Issuance                                                            |
|    Student Data + Authority Private Key submitted to /api/certificates/issue      |
|    Pre-flight Key Verification -> SHA-256 Canonical Hash -> Asymmetric Signature  |
|    DB Record Created -> High-Density QR Payload Built -> Vector PDF Generated     |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. Multi-Modal Verification                                                       |
|    - QR Code Scanner: Decodes payload {v, id, sig, hash, alg} -> Point Validation |
|    - Direct UUID Lookup: Queries registry & validates live signature              |
|    - Forensic PDF Upload: Extracts text/metadata & checks against tamper criteria |
+-----------------------------------------------------------------------------------+
```

---

## Verification Methods

Credify provides three independent verification pathways on the `/verify` portal:

### 1. Optical QR Code Verification
Physical diplomas and exported PDF certificates feature an embedded QR code containing a compact base64-encoded payload:

```json
{
  "v": 1,
  "id": "c1f7b022-482d-4b95-a841-3b7c8df0289a",
  "sig": "<base64_signature_prefix>",
  "hash": "<sha256_canonical_digest>",
  "alg": "ed25519"
}
```

When scanned via webcam or uploaded as an image, the verifier unpacks the payload, queries the public root key, and computes elliptic curve verification directly.

### 2. Forensic PDF Document Analysis
Recruiters can upload an issued PDF transcript directly. The verification engine:
- Extracts structural text streams and metadata.
- Recovers the certificate identifier.
- Cross-references the extracted student name, roll number, degree title, and CGPA against the cryptographic registry.
- Performs PDF stream forensics to detect post-issuance alterations or font substitutions.

### 3. Public Certificate Identifier Lookup
Manual verification using the certificate UUID via the web interface or REST API (`/api/certificates/[id]`).

---

## Technology Stack

### Frontend Architecture
- **Framework:** Next.js 14.2 (App Router, React Server Components)
- **Library:** React 18
- **Language:** TypeScript 5.4 (Strict type checking)
- **Styling:** Tailwind CSS 3.4
- **Data Visualization:** Recharts (Interactive cryptographic benchmark telemetry)
- **Client Scanner:** jsqr (In-browser canvas-based QR decoding)
- **Authentication:** Clerk SDK (`@clerk/nextjs`)

### Backend & Core Services
- **Runtime:** Node.js (v20+)
- **API Architecture:** Next.js Route Handlers (Serverless and Edge compatible)
- **Validation:** Zod (Runtime payload sanitization and schema enforcement)
- **Database:** PostgreSQL (Neon Serverless Postgres with connection pooling)
- **ORM:** Prisma ORM v5.12
- **Document Engine:** PDFKit (Vector certificate rendering with embedded cryptographic security borders)
- **Cryptography:** Native Node.js `crypto` module (Hardware-accelerated OpenSSL bindings)
- **Rate Limiting:** `rate-limiter-flexible` (Sliding window protection against brute-force attacks)

---

## Project Directory Structure

```
Credify/
├── prisma/
│   ├── schema.prisma           # Database models (Institution, Certificate, Verification)
│   └── seed.ts                 # Database seeding script
├── public/
│   ├── credify.svg             # Primary platform logo
│   └── embed.js                # Embeddable 2-line verification widget
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── benchmark/run/  # Cryptographic benchmark API route
│   │   │   ├── certificates/   # Issue, bulk issue, and ID lookup routes
│   │   │   ├── institutions/   # Registration and public directory routes
│   │   │   ├── v1/verify/      # Public REST API verification endpoint
│   │   │   └── verify/         # QR code and PDF upload verification routes
│   │   ├── benchmark/          # Interactive PKI benchmarking lab page
│   │   ├── bhavans/            # Reference college portal implementation
│   │   ├── certificates/[id]/  # Public certificate display page
│   │   ├── developers/         # Developer documentation and API key portal
│   │   ├── university/         # Authority registration, issuance, and dashboard
│   │   ├── verify/             # Universal verification portal
│   │   ├── layout.tsx          # Global RootLayout with theme and polyfills
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable UI components
│   ├── lib/
│   │   ├── crypto/             # Ed25519, ECC, and RSA cryptographic implementation
│   │   ├── pdf/                # PDFKit generation and forensic parsing
│   │   ├── qr/                 # QR payload generation and encoding
│   │   ├── api-handler.ts      # Standardized API wrapper with error handling
│   │   ├── db.ts               # Global Prisma client singleton
│   │   ├── polyfills.ts        # Serverless runtime polyfills
│   │   ├── rate-limit.ts       # Rate limiting configuration
│   │   └── validation.ts       # Zod validation schemas
│   └── middleware.ts           # Clerk authentication and route protection middleware
├── next.config.mjs             # Next.js configuration and serverless file tracing
├── package.json                # Project dependencies and operational scripts
├── tailwind.config.ts          # Tailwind styling tokens and custom palettes
├── tsconfig.json               # TypeScript compiler configuration
└── vitest.config.ts            # Vitest unit test runner configuration
```

---

## API Reference

All requests accept and return standard JSON payloads.

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| `POST` | `/api/institutions/register` | Register new authority and provision keypairs | Clerk Auth |
| `GET` | `/api/institutions` | Retrieve list of public registered institutions | Public |
| `POST` | `/api/certificates/issue` | Digitally sign and issue a single credential | Authority Private Key |
| `POST` | `/api/certificates/bulk` | Batch issue credentials from structured list or CSV | Authority Private Key |
| `GET` | `/api/certificates/:id` | Fetch public metadata for a specific credential | Public |
| `GET` | `/api/certificates/:id/pdf` | Generate and stream the certificate PDF | Public |
| `PATCH`| `/api/certificates/:id` | Revoke or update certificate status | Authority Admin |
| `POST` | `/api/verify/qr` | Verify credential via QR optical payload | Public (Rate-Limited) |
| `POST` | `/api/verify/upload` | Verify credential via forensic PDF upload | Public (Rate-Limited) |
| `POST` | `/api/v1/verify` | External REST verification API for ATS/HR | API Key / Public |
| `POST` | `/api/benchmark/run` | Execute algorithmic performance benchmarks | Public |

---

## Getting Started

### Prerequisites

- Node.js 18.18+ or 20.x
- npm or pnpm
- PostgreSQL database (or free Neon serverless Postgres instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mailmeatdarshan/Credify.git
   cd Credify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Populate `.env` with your database credentials and Clerk keys.

4. Initialize the database schema:
   ```bash
   npx prisma db push
   ```

5. (Optional) Seed the database with sample institutional data:
   ```bash
   npm run db:seed
   ```

6. Start the local development server:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000` in your browser.

---

## Environment Configuration

Configure the following variables in `.env`:

```env
# PostgreSQL connection string (supports Neon pooling)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Clerk Authentication Credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk Redirection Paths
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/university/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/university/dashboard"
```

---

## Testing & Quality Assurance

The codebase includes an automated test suite covering cryptographic correctness, tamper detection, canonical hashing, and bulk throughput:

```bash
# Run unit and integration tests
npm test

# Run tests in single-run mode
npm run test:run

# Run Next.js production build verification
npm run build

# Start production server
npm run start
```

Current test status: **106 / 106 tests passing**.

---

## Security & Threat Model

Credify is designed around defense-in-depth principles:

1. **Zero-Knowledge Key Storage:** Private keys are generated in-memory during authority onboarding and downloaded directly by the administrator. Private keys are never stored in the database, preventing compromise even in the event of an infrastructure breach.
2. **Pre-flight Key Matching:** Every issuance request cryptographically validates that the provided private key mathematically derives the institution's registered public key before any database write occurs.
3. **Immutability & Tamper Detection:** Canonical SHA-256 digests ensure that any post-issuance modification to student credentials immediately invalidates the signature.
4. **Revocation Authority:** Issuing authorities maintain cryptographic control to mark compromised or annulled credentials as revoked in the public registry.
5. **Rate Limiting:** Public verification endpoints are protected by sliding-window rate limiters to prevent distributed denial-of-service and automated enumeration attacks.

---

## License

This project is licensed under the MIT License.
