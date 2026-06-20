<div align="center">
  <img src="./public/logo.svg" alt="AnchorProof Logo" width="120" />
</div>

<div align="center">
  <h1 style="font-size: 3.5rem; font-weight: 800; background: linear-gradient(135deg, #818cf8 0%, #22d3ee 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
    AnchorProof
  </h1>
</div>

<div align="center">
  <p style="font-size: 1.25rem; color: #94a3b8;">
    <strong>Enterprise Verifiable Auditing</strong>
  </p>
</div>

<div align="center">
  <p style="font-size: 1.1rem; color: #64748b;">
    Verify every conversation · Prove every action · Trust every audit
  </p>
</div>

<div align="center">
  <a href="#overview" style="color: #818cf8;">Overview</a> •
  <a href="#architecture" style="color: #818cf8;">Architecture</a> •
  <a href="#security" style="color: #818cf8;">Security</a> •
  <a href="#deployment" style="color: #818cf8;">Deployment</a>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Sui-zkLogin-4DA2FF?style=for-the-badge" alt="Sui" />
  <img src="https://img.shields.io/badge/Walrus-Storage-00D4AA?style=for-the-badge" alt="Walrus" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</div>

<br />

<div align="center" style="background: #1e293b; padding: 1.5rem 2rem; border-radius: 12px; border-left: 4px solid #818cf8;">
  <p style="font-size: 1.2rem; color: #e2e8f0;">
    <strong>Trust Infrastructure for Enterprise AI</strong><br />
    Cryptographically verifiable conversations, immutable audit trails, decentralized storage, and blockchain-backed proof systems.
  </p>
</div>

---

<div align="center">
  <h2>📖 Table of Contents</h2>
</div>

<details>
<summary><b>Click to expand</b></summary>

<div>
  <ul>
    <li><a href="#-overview">🚀 Overview</a></li>
    <li><a href="#-key-features">✨ Key Features</a></li>
    <li><a href="#%EF%B8%8F-tech-stack">🛠️ Tech Stack</a></li>
    <li><a href="#-quick-start">🚦 Quick Start</a></li>
    <li><a href="#-environment-variables">🔐 Environment Variables</a></li>
    <li><a href="#-database-schema">📊 Database Schema</a></li>
    <li><a href="#-api-endpoints">📡 API Endpoints</a></li>
    <li><a href="#-authentication-flow">🔄 Authentication Flow</a></li>
    <li><a href="#-tenant-management">🏢 Tenant Management</a></li>
    <li><a href="#-audit-logging">📝 Audit Logging</a></li>
    <li><a href="#-development">💻 Development</a></li>
    <li><a href="#-deployment">🚀 Deployment</a></li>
    <li><a href="#-contributing">🤝 Contributing</a></li>
    <li><a href="#-license">📄 License</a></li>
    <li><a href="#%EF%B8%8F-architecture-diagrams">🏗️ Architecture Diagrams</a></li>
  </ul>
</div>

</details>

---

<div align="center">
  <h2>🚀 Overview</h2>
</div>

<div>
  <p>
    <strong>AnchorProof</strong> is a next-generation enterprise cryptographic auditing platform that leverages <strong>Sui zkLogin</strong> for seamless authentication and <strong>Walrus</strong> for decentralized storage. Built for organizations that demand <strong>immutable audit trails</strong>, <strong>cryptographic verification</strong>, and <strong>enterprise-grade security</strong>.
  </p>
</div>

<div align="center">

| Feature                              | Description                                         |
| ------------------------------------ | --------------------------------------------------- |
| 🔐 **Zero-Knowledge Authentication** | Passwordless, private, and secure                   |
| 📊 **Immutable Audit Trails**        | Every action cryptographically verified             |
| 🏢 **Enterprise Multi-Tenancy**      | Support for both personal and enterprise workspaces |
| 🌊 **Decentralized Storage**         | Walrus protocol for tamper-proof data               |
| 🔍 **On-Chain Verification**         | Verify conversations against the Sui blockchain     |

</div>

---

<div align="center">
  <h2>✨ Key Features</h2>
</div>

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%" style="padding: 20px;">
        <h3>🔑 Authentication</h3>
        <p>Sui zkLogin with Google Workspace<br/>Personal & Enterprise tenant detection<br/>Cryptographic identity from email</p>
      </td>
      <td align="center" width="33%" style="padding: 20px;">
        <h3>🏢 Tenant Management</h3>
        <p>Personal tenants for @gmail.com<br/>Shared tenants for custom domains<br/>Admin role assignment</p>
      </td>
      <td align="center" width="33%" style="padding: 20px;">
        <h3>📝 Audit Logging</h3>
        <p>Immutable audit trail<br/>15+ predefined events<br/>Search, filter & export</p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px;">
        <h3>🔐 Verification</h3>
        <p>On-chain verification<br/>Tamper detection<br/>Blob integrity</p>
      </td>
      <td align="center" style="padding: 20px;">
        <h3>🎨 User Experience</h3>
        <p>Dark theme<br/>Responsive design<br/>Real-time updates</p>
      </td>
      <td align="center" style="padding: 20px;">
        <h3>🔗 Blockchain</h3>
        <p>Sui blockchain integration<br/>Walrus decentralized storage<br/>ZK proofs</p>
      </td>
    </tr>
  </table>
</div>

---

<div align="center">
  <h2>🛠️ Tech Stack</h2>
</div>

<details>
<summary><b>Frontend</b></summary>

<div align="center">

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| **Next.js 16**      | React framework with App Router |
| **TypeScript**      | Type-safe JavaScript            |
| **Tailwind CSS**    | Utility-first CSS framework     |
| **Lucide Icons**    | Beautiful icon library          |
| **Mysten Dapp Kit** | Sui wallet integration          |
| **Enoki SDK**       | zkLogin authentication          |

</div>

</details>

<details>
<summary><b>Backend</b></summary>

<div align="center">

| Technology             | Purpose                     |
| ---------------------- | --------------------------- |
| **Next.js API Routes** | Serverless API endpoints    |
| **Prisma ORM**         | Database ORM and migrations |
| **PostgreSQL**         | Primary database            |
| **Supabase**           | Database hosting            |
| **Sui SDK**            | Blockchain integration      |
| **Walrus SDK**         | Decentralized storage       |

</div>

</details>

<details>
<summary><b>Authentication</b></summary>

<div align="center">

| Technology           | Purpose                       |
| -------------------- | ----------------------------- |
| **Sui zkLogin**      | Zero-knowledge authentication |
| **Google Workspace** | Enterprise SSO provider       |
| **Enoki**            | zkLogin implementation        |

</div>

</details>

<details>
<summary><b>DevOps</b></summary>

<div align="center">

| Technology | Purpose                |
| ---------- | ---------------------- |
| **Vercel** | Deployment and hosting |
| **Git**    | Version control        |
| **Yarn**   | Package manager        |
| **ESLint** | Code linting           |

</div>

</details>

---

<div align="center">
  <h2>🚦 Quick Start</h2>
</div>

<div>
  <h3>Prerequisites</h3>
  <ul>
    <li>Node.js 18+</li>
    <li>Yarn package manager</li>
    <li>PostgreSQL database (Supabase recommended)</li>
    <li>Sui wallet (for development)</li>
  </ul>
</div>

<div>
  <h3>Installation</h3>
</div>

<div>
  <p><b>1. Clone the repository</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;">git clone https://github.com/yourusername/anchorproof.git</code><br />
    <code style="color: #e2e8f0;">cd anchorproof</code>
  </div>

  <p><b>2. Install dependencies</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;">yarn install</code>
  </div>

  <p><b>3. Set up environment variables</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;">cp .env.example .env.local</code><br />
    <code style="color: #64748b;"># Edit .env.local with your values</code>
  </div>

  <p><b>4. Set up the database</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;"># Push the schema to your database</code><br />
    <code style="color: #e2e8f0;">npx prisma db push</code><br /><br />
    <code style="color: #e2e8f0;"># Generate Prisma client</code><br />
    <code style="color: #e2e8f0;">npx prisma generate</code>
  </div>

  <p><b>5. Run the development server</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;">yarn dev</code>
  </div>

  <p><b>6. Open your browser</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;">http://localhost:3000</code>
  </div>
</div>

---

<div align="center">
  <h2>🔐 Environment Variables</h2>
</div>

<div>
  <p>Create a <code>.env.local</code> file with the following variables:</p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;"># Database</code><br />
    <code style="color: #e2e8f0;">DATABASE_URL="postgresql://username:password@host:5432/database"</code><br /><br />
    <code style="color: #e2e8f0;"># Sui/Enoki</code><br />
    <code style="color: #e2e8f0;">NEXT_PUBLIC_ENOKI_API_KEY="your_enoki_api_key"</code><br />
    <code style="color: #e2e8f0;">NEXT_PUBLIC_SUI_NETWORK="testnet"</code><br /><br />
    <code style="color: #e2e8f0;"># Walrus</code><br />
    <code style="color: #e2e8f0;">WALRUS_PUBLISHER_URL="https://publisher.walrus-testnet.walrus.space"</code><br />
    <code style="color: #e2e8f0;">WALRUS_AGGREGATOR_URL="https://aggregator.walrus-testnet.walrus.space"</code><br /><br />
    <code style="color: #e2e8f0;"># Next.js</code><br />
    <code style="color: #e2e8f0;">NEXTAUTH_URL="http://localhost:3000"</code><br />
    <code style="color: #e2e8f0;">NEXT_PUBLIC_APP_URL="http://localhost:3000"</code><br /><br />
    <code style="color: #e2e8f0;"># Optional: Redis for caching</code><br />
    <code style="color: #e2e8f0;">REDIS_URL="redis://localhost:6379"</code>
  </div>
</div>

---

<div align="center">
  <h2>📊 Database Schema</h2>
</div>

<details>
<summary><b>Tenant Model</b></summary>
<div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
  <pre style="color: #e2e8f0; margin: 0;">
model Tenant {
  id               String         @id @default(cuid())
  name             String
  slug             String         @unique
  emailDomain      String
  suiAddress       String         @unique
  walrusNamespace  String
  subscriptionTier String         @default("free")
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  apiKeys          ApiKey[]
  tempMessages     TempMessage[]
  users            User[]
  verifications    Verification[]
  auditLogs        AuditLog[]
  reports          Report[]
}
  </pre>
</div>
</details>

<details>
<summary><b>User Model</b></summary>
<div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
  <pre style="color: #e2e8f0; margin: 0;">
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  tenantId  String
  role      String   @default("viewer")
  createdAt DateTime @default(now())
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

@@unique([tenantId, email])
}

  </pre>
</div>
</details>

<details>
<summary><b>AuditLog Model</b></summary>
<div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
  <pre style="color: #e2e8f0; margin: 0;">
model AuditLog {
  id             String    @id @default(cuid())
  tenantId       String
  action         String
  blobId         String?
  conversationId String?
  details        Json?
  ipAddress      String?
  userAgent      String?
  createdAt      DateTime  @default(now())
  
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([action])
  @@index([createdAt])
}
  </pre>
</div>
</details>

<details>
<summary><b>ApiKey Model</b></summary>
<div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
  <pre style="color: #e2e8f0; margin: 0;">
model ApiKey {
  id                  String    @id @default(cuid())
  tenantId            String
  keyHash             String    @unique
  name                String
  role                String    @default("viewer")
  expiresAt           DateTime
  lastUsedAt          DateTime?
  createdAt           DateTime  @default(now())
  publicKey           String
  encryptedPrivateKey String
  tenant              Tenant    @relation(fields: [tenantId], references: [id])
}
  </pre>
</div>
</details>

<details>
<summary><b>Verification Model</b></summary>
<div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
  <pre style="color: #e2e8f0; margin: 0;">
model Verification {
  id             String   @id @default(cuid())
  tenantId       String
  conversationId String
  blobId         String
  suiTxHash      String
  customerId     String
  agentId        String?
  modelUsed      String?
  messageCount   Int
  contentHash    String?
  verifiedAt     DateTime @default(now())
  metadata       Json?
  createdAt      DateTime @default(now())
  tenant         Tenant   @relation(fields: [tenantId], references: [id])
}
  </pre>
</div>
</details>

<details>
<summary><b>TempMessage Model</b></summary>
<div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
  <pre style="color: #e2e8f0; margin: 0;">
model TempMessage {
  id             String   @id @default(cuid())
  tenantId       String
  conversationId String
  role           String
  content        String
  signature      String
  publicKey      String
  timestamp      DateTime @default(now())
  createdAt      DateTime @default(now())
  tenant         Tenant   @relation(fields: [tenantId], references: [id])

@@index([tenantId, conversationId])
}

  </pre>
</div>
</details>

<details>
<summary><b>Report Model</b></summary>
<div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
  <pre style="color: #e2e8f0; margin: 0;">
model Report {
  id               String    @id @default(cuid())
  tenantId         String
  name             String
  type             String
  generatedBy      String
  generatedAt      DateTime  @default(now())
  conversationId   String?
  summary          Json?
  hash             String?
  size             Int?
  status           String
  expiresAt        DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  tenant           Tenant    @relation(fields: [tenantId], references: [id])
}
  </pre>
</div>
</details>

---

<div align="center">
  <h2>📡 API Endpoints</h2>
</div>

<div>
  <h3>Tenant Management</h3>
  <h4><code>POST /api/tenant</code></h4>
  <p>Create or retrieve a tenant for a user</p>
  
  <p><b>Request Body:</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <pre style="color: #e2e8f0; margin: 0;">
{
  "suiAddress": "0x...",
  "email": "user@domain.com",
  "name": "User Name",
  "emailDomain": "domain.com"
}
    </pre>
  </div>

  <p><b>Response:</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <pre style="color: #e2e8f0; margin: 0;">
{
  "success": true,
  "tenant": {
    "id": "tenant_id",
    "name": "User's Enterprise",
    "slug": "personal-user-1734567890",
    "emailDomain": "gmail.com",
    "suiAddress": "0x...",
    "walrusNamespace": "ns-personal-1734567890",
    "subscriptionTier": "free"
  },
  "user": {
    "id": "user_id",
    "email": "user@domain.com",
    "name": "User Name",
    "tenantId": "tenant_id",
    "role": "admin"
  },
  "isPublicDomain": true,
  "isNewTenant": true,
  "tenantSuiAddress": "0x..."
}
    </pre>
  </div>
</div>

<div>
  <h3>Audit Logs</h3>
  <h4><code>GET /api/audit/list</code></h4>
  <p>Fetch audit logs for a tenant</p>
  
  <p><b>Query Parameters:</b></p>
  <ul>
    <li><code>action</code> - Filter by action type (optional)</li>
    <li><code>limit</code> - Number of records (default: 100)</li>
    <li><code>cursor</code> - Pagination cursor (optional)</li>
  </ul>

  <p><b>Response:</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <pre style="color: #e2e8f0; margin: 0;">
{
  "logs": [
    {
      "id": "log_id",
      "action": "TENANT_CREATED",
      "actorName": "User Name",
      "actorEmail": "user@domain.com",
      "details": {
        "tenantName": "User's Enterprise",
        "isPublicDomain": true
      },
      "createdAt": "2026-06-20T16:00:00Z"
    }
  ],
  "total": 42,
  "nextCursor": "cursor_string"
}
    </pre>
  </div>
</div>

---

<div align="center">
  <h2>🔄 Authentication Flow</h2>
</div>

<div>
  <ol>
    <li><b>User clicks "Sign In with Google"</b> on the login page</li>
    <li><b>Enoki zkLogin initiates</b> Google OAuth flow</li>
    <li><b>User grants permission</b> to access their Google account</li>
    <li><b>Enoki returns zkLogin credentials</b> to the frontend</li>
    <li><b>Frontend verifies with Sui blockchain</b> to get suiAddress</li>
    <li><b>Frontend calls <code>/api/tenant</code></b> with email and suiAddress</li>
    <li><b>API determines tenant type</b> (personal vs enterprise)</li>
    <li><b>API creates/retrieves tenant</b> from database</li>
    <li><b>API creates/updates user</b> in the tenant</li>
    <li><b>API returns tenant and user data</b> to frontend</li>
    <li><b>Frontend sets session cookie</b> and redirects to dashboard</li>
  </ol>
</div>

---

<div align="center">
  <h2>🏢 Tenant Management</h2>
</div>

<div>
  <h3>Personal Tenants (<code>@gmail.com</code>, <code>@googlemail.com</code>)</h3>
  <ul>
    <li>Each user gets their <b>own dedicated tenant</b></li>
    <li>Tenant name: <code>{User's Name}'s Enterprise</code></li>
    <li>Slug: <code>personal-{email-prefix}-{timestamp}</code></li>
    <li><code>suiAddress</code> = User's Sui address (from zkLogin)</li>
  </ul>
</div>

<div>
  <h3>Enterprise Tenants (Custom Domains)</h3>
  <ul>
    <li>All users with the <b>same domain share one tenant</b></li>
    <li>Tenant name: <code>{Domain} Corp</code></li>
    <li>Slug: <code>{domain-with-hyphens}</code></li>
    <li><code>suiAddress</code> = <b>First user's</b> Sui address (never updated)</li>
    <li>New users are added to the existing tenant</li>
  </ul>
</div>

<div>
  <h3>Tenant Slug Generation</h3>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <pre style="color: #e2e8f0; margin: 0;">
// Personal: personal-john-1734567890
// Enterprise: banking-enterprise
// With duplicate: banking-enterprise-1
    </pre>
  </div>
</div>

<div>
  <h3>Tenant Resolution Logic</h3>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <pre style="color: #e2e8f0; margin: 0;">
if (isPublicDomain) {
  // Check by suiAddress (personal tenant)
  tenant = await prisma.tenant.findFirst({
    where: { suiAddress: suiAddress }
  });
} else {
  // Check by emailDomain (enterprise tenant)
  tenant = await prisma.tenant.findFirst({
    where: { emailDomain: emailDomain }
  });
}
    </pre>
  </div>
</div>

---

<div align="center">
  <h2>📝 Audit Logging</h2>
</div>

<div align="center">

| Action                  | Description                       | Color      |
| ----------------------- | --------------------------------- | ---------- |
| `TENANT_CREATED`        | New tenant workspace created      | 🟡 Amber   |
| `USER_LOGIN`            | User authenticated                | 🟣 Indigo  |
| `USER_LOGOUT`           | User session ended                | ⚪ Gray    |
| `CONVERSATION_SAVED`    | Conversation encrypted and stored | 🔵 Blue    |
| `CONVERSATION_VERIFIED` | Verified against on-chain record  | 🟢 Emerald |
| `BLOB_RETRIEVED`        | Blob fetched from Walrus storage  | 🩵 Cyan    |
| `API_KEY_CREATED`       | New API key generated             | 🟣 Purple  |
| `API_KEY_REVOKED`       | API key permanently revoked       | 🔴 Red     |
| `TAMPER_DETECTED`       | Critical: Data tampering detected | 🔴 Red     |
| `VERIFICATION_FAILED`   | Verification check failed         | 🔴 Red     |
| `REPORT_GENERATED`      | Compliance report generated       | 🟢 Green   |
| `REPORT_DELETED`        | Report permanently deleted        | 🔴 Red     |

</div>

<div>
  <h3>Audit Log Structure</h3>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <pre style="color: #e2e8f0; margin: 0;">
interface AuditLog {
  id: string;
  tenantId: string;
  action: string;
  details: {
    email: string;
    name: string;
    tenantName: string;
    tenantSlug: string;
    requestSuiAddress: string;
    tenantSuiAddress: string;
    isNewTenant: boolean;
    isPublicDomain: boolean;
    action: string;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
    </pre>
  </div>
</div>

---

<div align="center">
  <h2>💻 Development</h2>
</div>

<div>
  <h3>Project Structure</h3>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <pre style="color: #e2e8f0; margin: 0;">
anchorproof/
├── app/
│   ├── api/
│   │   ├── tenant/
│   │   │   └── route.ts        # Tenant management
│   │   └── audit/
│   │       └── list/
│   │           └── route.ts    # Audit log retrieval
│   ├── dashboard/
│   │   └── page.tsx           # Main dashboard
│   └── login/
│       └── page.tsx           # Login page
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx      # Authentication component
│   ├── audit/
│   │   └── AuditLog.tsx       # Audit log viewer
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── audit.ts               # Audit logging utilities
│   └── enoki/
│       └── auth.ts            # Enoki authentication
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
└── types/                     # TypeScript type definitions
    </pre>
  </div>
</div>

<div>
  <h3>Useful Commands</h3>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <pre style="color: #e2e8f0; margin: 0;">
# Development
yarn dev

# Build for production

yarn build
yarn start

# Database management

npx prisma generate # Generate Prisma client
npx prisma db push # Push schema to database
npx prisma studio # Open Prisma Studio

# Linting

yarn lint

# Type checking

yarn type-check

</pre>

  </div>
</div>

<div>
  <h3>Code Style</h3>
  <ul>
    <li><b>TypeScript</b> with strict mode</li>
    <li><b>ESLint</b> for code quality</li>
    <li><b>Prettier</b> for formatting</li>
    <li><b>Conventional commits</b> for commit messages</li>
  </ul>
</div>

---

<div align="center">
  <h2>🚀 Deployment</h2>
</div>

<div>
  <h3>Deploy to Vercel</h3>
  
  <p><b>1. Push your code to GitHub</b></p>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;">git push origin main</code>
  </div>

  <p><b>2. Import project in Vercel</b></p>
  <ul>
    <li>Connect your GitHub repository</li>
    <li>Configure environment variables</li>
    <li>Deploy!</li>
  </ul>

  <p><b>3. Environment Variables (Vercel)</b></p>
  <ul>
    <li>Add all variables from <code>.env.local</code></li>
    <li>Set <code>NEXTAUTH_URL</code> to your production URL</li>
  </ul>
</div>

<div>
  <h3>Database Migration</h3>
  <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #1e293b; margin: 0.5rem 0;">
    <code style="color: #e2e8f0;"># Before deployment, run migrations</code><br />
    <code style="color: #e2e8f0;">npx prisma migrate deploy</code>
  </div>
</div>

---

<div align="center">
  <h2>🙏 Acknowledgments</h2>
</div>

<div>
  <ul>
    <li><a href="https://sui.io/">Sui Foundation</a> for zkLogin</li>
    <li><a href="https://walrus.space/">Walrus Protocol</a> for decentralized storage</li>
    <li><a href="https://mystenlabs.com/">Mysten Labs</a> for Dapp Kit</li>
    <li><a href="https://vercel.com/">Vercel</a> for hosting</li>
    <li><a href="https://supabase.com/">Supabase</a> for database hosting</li>
  </ul>
</div>

---

🏗️ Architecture Diagrams
System Architecture Flow

```mermaid
graph TB
    subgraph "Client Layer"
        A[Login Form<br/>zkLogin] --> B[Dashboard<br/>Main UI]
        B --> C[Audit Log Viewer<br/>Search & Filter]
    end

    subgraph "API Gateway Layer"
        D[/"/api/tenant<br/>Create/Retrieve/Update"/]
        E[/"/api/audit<br/>List/Filter/Export"/]
        F[/"/api/conversation<br/>Save/Verify/Retrieve"/]
    end

    subgraph "Service Layer"
        G[Tenant Management]
        H[User Management]
        I[Audit Log Service]
        J[Crypto Verification]
        K[Walrus Storage]
        L[Export Service]
    end

    subgraph "Data Layer"
        M[(PostgreSQL Database)]
        N[(Redis Cache)]
    end

    subgraph "Blockchain Layer"
        O[(Sui Blockchain<br/>zkLogin & On-Chain Records)]
        P[(Walrus Storage<br/>Decentralized Blobs)]
    end

    A --> D
    B --> E
    B --> F
    D --> G
    D --> H
    E --> I
    F --> J
    F --> K
    I --> L
    G --> M
    H --> M
    I --> M
    J --> O
    K --> P
```

Component Interaction Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Frontend
    participant Enoki as Enoki zkLogin
    participant API as Next.js API
    participant DB as PostgreSQL
    participant Sui as Sui Blockchain
    participant Walrus as Walrus Storage

    User->>Frontend: Click "Sign In with Google"
    Frontend->>Enoki: Initiate zkLogin
    Enoki->>User: Google OAuth Consent
    User->>Enoki: Grant Access
    Enoki->>Frontend: Return zkLogin Credentials
    Frontend->>Sui: Verify zkLogin
    Sui->>Frontend: Return suiAddress

    Frontend->>API: POST /api/tenant {email, suiAddress}
    API->>DB: Find/Create Tenant
    DB->>API: Return Tenant
    API->>DB: Create/Update User
    DB->>API: Return User
    API->>Frontend: Return Tenant + User

    Frontend->>User: Redirect to Dashboard
    User->>Frontend: View Audit Logs
    Frontend->>API: GET /api/audit/list
    API->>DB: Query Audit Logs
    DB->>API: Return Logs
    API->>Frontend: Return Formatted Logs

    User->>Frontend: Save Conversation
    Frontend->>API: POST /api/conversation/save
    API->>Walrus: Store Encrypted Blob
    Walrus->>API: Return Blob ID
    API->>Sui: Record On-Chain
    Sui->>API: Return Transaction Hash
    API->>DB: Save Audit Log
    API->>Frontend: Return Success
```

Data Flow Diagram

```mermaid
graph LR
    subgraph "Authentication Flow"
        A1[User Email] --> A2[zkLogin]
        A2 --> A3[suiAddress]
    end

    subgraph "Tenant Resolution"
        B1[emailDomain] --> B2{Public Domain?}
        B2 -->|Yes| B3[Personal Tenant<br/>suiAddress = User]
        B2 -->|No| B4[Enterprise Tenant<br/>suiAddress = First User]
    end

    subgraph "Audit Logging"
        C1[User Action] --> C2[Create Audit Log]
        C2 --> C3[Store in Database]
        C3 --> C4[Index for Search]
    end

    A3 --> B3
    A3 --> B4
    B3 --> C1
    B4 --> C1
```

Entity Relationship Diagram

```mermaid
erDiagram
    Tenant ||--o{ User : has
    Tenant ||--o{ AuditLog : has
    Tenant ||--o{ ApiKey : has
    Tenant ||--o{ Verification : has
    Tenant ||--o{ TempMessage : has
    Tenant ||--o{ Report : has

    Tenant {
        string id PK
        string name
        string slug UK
        string emailDomain
        string suiAddress UK
        string walrusNamespace
        string subscriptionTier
        datetime createdAt
        datetime updatedAt
    }

    User {
        string id PK
        string email UK
        string name
        string tenantId FK
        string role
        datetime createdAt
    }

    AuditLog {
        string id PK
        string tenantId FK
        string action
        string blobId
        string conversationId
        json details
        string ipAddress
        string userAgent
        datetime createdAt
    }

    ApiKey {
        string id PK
        string tenantId FK
        string keyHash UK
        string name
        string role
        datetime expiresAt
        datetime lastUsedAt
        datetime createdAt
        string publicKey
        string encryptedPrivateKey
    }

    Verification {
        string id PK
        string tenantId FK
        string conversationId
        string blobId
        string suiTxHash
        string customerId
        string agentId
        string modelUsed
        int messageCount
        string contentHash
        datetime verifiedAt
        json metadata
        datetime createdAt
    }

    TempMessage {
        string id PK
        string tenantId FK
        string conversationId
        string role
        string content
        string signature
        string publicKey
        datetime timestamp
        datetime createdAt
    }

    Report {
        string id PK
        string tenantId FK
        string name
        string type
        string generatedBy
        datetime generatedAt
        string conversationId
        json summary
        string hash
        int size
        string status
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
    }
```

<p align="center">Built with ❤️ by the AnchorProof - Muhammad Adeel</p> <p align="center"> <sub>🔐 Secure • 📊 Transparent • 🚀 Enterprise-Grade</sub> </p>
