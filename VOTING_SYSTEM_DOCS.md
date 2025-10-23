# Secure Voting System Implementation

## Overview
This implementation provides a secure, end-to-end encrypted voting system with OTP verification and verifiable receipts.

## Features

### 1. **Multi-Step Voting Flow**
- Election selection
- Email OTP verification
- Encrypted ballot viewing
- Vote submission with encryption
- Receipt generation

### 2. **Security Features**
- **End-to-End Encryption**: Votes are encrypted on the client side using RSA-OAEP before transmission
- **OTP Verification**: Email-based OTP (One-Time Password) for voter authentication
- **Vote Receipts**: SHA-256 hashed receipts for public verification
- **One Vote Per Position**: Students can vote once per position in an election
- **Server-Side Validation**: Multiple checks to prevent duplicate voting

### 3. **Encryption Flow**

#### Client-Side Encryption
```javascript
// 1. Get election public key
const publicKey = await VoteAPI.getElectionPublicKey(electionId);

// 2. Encrypt each vote using RSA-OAEP with SHA-256
const encryptedVote = await VoteAPI.encryptVote(candidateId, publicKey);

// 3. Send encrypted votes to server
await VoteAPI.castVote(electionId, encryptedVotes);
```

#### Server-Side Storage
- Server stores encrypted votes WITHOUT decryption
- Only encrypted data is persisted in database
- Private keys stored securely (in production, use HSM or KMS)

## API Endpoints

### Voting Endpoints (`/api/vote`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/elections/ongoing` | GET | Student | Get list of ongoing elections |
| `/election/:electionId/public-key` | GET | Student | Get RSA public key for encryption |
| `/request-otp` | POST | Student | Request OTP for voting |
| `/verify-otp` | POST | Student | Verify OTP code |
| `/ballot/:electionId` | GET | Student | Get ballot after OTP verification |
| `/cast` | POST | Student | Submit encrypted votes |
| `/status/:electionId` | GET | Student | Check if voted in election |

## Voting Flow Diagram

```
┌─────────────────┐
│ Select Election │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Request OTP    │──── Email sent to registered address
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Verify OTP    │──── 10-minute expiry
└────────┬────────┘
         │
         v
┌─────────────────┐
│  View Ballot    │──── Grouped by position
│  & Select Votes │──── One vote per position
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Encrypt Votes   │──── RSA-OAEP on client
│  (Client-side)  │──── Using election public key
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Submit to Server│──── Server validates
│                 │──── Stores encrypted
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Receive Receipt │──── SHA-256 hash
│  (Verification) │──── For public audit
└─────────────────┘
```

## Database Schema

### VOTE Table
```sql
CREATE TABLE `VOTE` (
  `Vote_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `Std_id` BIGINT NOT NULL,
  `Can_id` BIGINT NOT NULL,
  `Election_id` INT NOT NULL,
  `Vote_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `Encrypted_vote` TEXT NOT NULL,
  
  UNIQUE KEY `VOTE_Std_id_Election_id_Can_id_key` (`Std_id`, `Election_id`, `Can_id`),
  INDEX `VOTE_Std_id_Election_id_idx` (`Std_id`, `Election_id`),
  
  FOREIGN KEY (`Std_id`) REFERENCES `STUDENT`(`Std_id`),
  FOREIGN KEY (`Can_id`) REFERENCES `CANDIDATE`(`Can_id`),
  FOREIGN KEY (`Election_id`) REFERENCES `ELECTION`(`Election_id`)
);
```

**Note**: The unique constraint allows multiple votes per student per election (one per position/candidate combination).

## Security Considerations

### Current Implementation (Development)
- OTPs stored in memory (Map)
- RSA keys generated per election session
- Email via Gmail SMTP

### Production Recommendations

#### 1. **OTP Storage**
- Use Redis with TTL for OTP storage
- Implement rate limiting (max 3 OTP requests per hour)
- Add CAPTCHA for OTP requests

#### 2. **Key Management**
- Use Hardware Security Module (HSM) or AWS KMS
- Rotate keys after each election
- Multi-signature scheme for key access
- Store public keys in database, private keys in secure vault

#### 3. **Vote Tallying**
Two approaches:

**A. Homomorphic Encryption** (Recommended)
```javascript
// Allows tallying without decryption
const totalVotes = votes.reduce((sum, encryptedVote) => {
  return homomorphicAdd(sum, encryptedVote);
}, 0);
// Decrypt only the final sum
```

**B. Trusted Tallying Service**
```javascript
// Multi-party computation
// Requires M of N admins to decrypt
// Example: 3 of 5 admins must agree
```

#### 4. **Audit Trail**
- Publish encrypted votes publicly (without voter identity)
- Publish receipt hashes for verification
- Allow voters to verify their receipt exists
- Implement zero-knowledge proofs for vote verification

#### 5. **Additional Security**
- HTTPS/TLS for all communication
- Certificate pinning in mobile apps
- IP rate limiting
- Distributed ledger for immutable audit trail
- Time-bound voting (enforce election start/end times)

## Receipt Verification

### Vote Receipt Structure
```json
{
  "position": "President",
  "voteId": 12345,
  "receiptHash": "a1b2c3d4e5f6...",
  "timestamp": "2025-10-23T12:34:56.789Z"
}
```

### Verification Process
1. After election closes, admin publishes all receipt hashes
2. Voter can check if their receipt hash exists in published list
3. Confirms vote was counted without revealing who they voted for

## Testing

### Manual Testing Steps

1. **Start Server**
```bash
cd server
npm run dev
```

2. **Login as Student**
- Email: student@example.com
- Navigate to Cast Vote page

3. **Select Ongoing Election**
- Must have Status = 'Ongoing'
- Must have approved candidates

4. **Request OTP**
- Check email for 6-digit code
- Code expires in 10 minutes

5. **Verify OTP**
- Enter code
- Should load ballot

6. **Cast Vote**
- Select one candidate per position
- Submit button enables when all positions filled
- Votes encrypted on client
- Receive receipt hashes

7. **Verify Receipt**
- Save receipt hashes
- After election, check against published list

### Unit Test Examples

```javascript
// Test OTP generation
describe('requestVotingOTP', () => {
  it('should send OTP to registered email', async () => {
    const response = await request(app)
      .post('/api/vote/request-otp')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ electionId: 1 });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('OTP sent');
  });
});

// Test encryption
describe('VoteAPI.encryptVote', () => {
  it('should encrypt candidate ID', async () => {
    const candidateId = '12345';
    const encrypted = await VoteAPI.encryptVote(candidateId, publicKey);
    
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toContain(candidateId);
  });
});

// Test duplicate vote prevention
describe('castVote', () => {
  it('should prevent voting twice in same election', async () => {
    // First vote
    await castVote(studentId, electionId, votes);
    
    // Second vote attempt
    const response = await castVote(studentId, electionId, votes);
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('already voted');
  });
});
```

## Environment Variables

Add to `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Gmail Setup**:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in EMAIL_PASSWORD

## Future Enhancements

1. **Blockchain Integration**
   - Store vote hashes on public blockchain
   - Immutable audit trail
   - Smart contract for tallying

2. **Advanced Cryptography**
   - Implement homomorphic encryption
   - Zero-knowledge proofs for verification
   - Threshold cryptography for admin keys

3. **Mobile App**
   - React Native app
   - Biometric authentication
   - Push notifications for OTP

4. **Analytics Dashboard**
   - Real-time voting statistics (anonymized)
   - Turnout tracking
   - Demographic analysis

5. **Accessibility**
   - Screen reader support
   - Multiple language support
   - Simplified voting interface

## License
MIT

## Contributors
- Vishal Keshri (Developer)

## Support
For issues or questions, contact: vishalkeshri2001@gmail.com
