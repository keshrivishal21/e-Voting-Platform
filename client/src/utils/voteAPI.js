const API_BASE_URL = 'http://localhost:5000/api';

class VoteAPI {
  // Get current token
  static getCurrentToken() {
    try {
      const currentUserType = localStorage.getItem('currentUserType');
      if (currentUserType) {
        const tokenKey = `${currentUserType.toLowerCase()}Token`;
        return localStorage.getItem(tokenKey);
      }
      return null;
    } catch (error) {
      console.error('Error getting current token:', error);
      return null;
    }
  }

  // Get ongoing elections
  static async getOngoingElections() {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/vote/elections/ongoing`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get election public key for encryption
  static async getElectionPublicKey(electionId) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/vote/election/${electionId}/public-key`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Request OTP for voting
  static async requestVotingOTP(electionId) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/vote/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ electionId })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Verify OTP
  static async verifyOTP(electionId, otp) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/vote/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ electionId, otp })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Get ballot (after OTP verification)
  static async getBallot(electionId) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/vote/ballot/${electionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Cast vote (with encrypted votes)
  static async castVote(electionId, encryptedVotes) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/vote/cast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ electionId, encryptedVotes })
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Check vote status
  static async checkVoteStatus(electionId) {
    try {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/vote/status/${electionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return { response, data };
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Encrypt vote using public key (RSA encryption)
  static async encryptVote(candidateId, publicKey) {
    try {
      
      // Remove PEM headers and footers, and all whitespace
      const pemHeader = "-----BEGIN PUBLIC KEY-----";
      const pemFooter = "-----END PUBLIC KEY-----";
      
      // Clean the public key string
      let cleanKey = publicKey.trim();
      
      // Remove headers if present
      if (cleanKey.includes(pemHeader)) {
        cleanKey = cleanKey.replace(pemHeader, '');
      }
      if (cleanKey.includes(pemFooter)) {
        cleanKey = cleanKey.replace(pemFooter, '');
      }
      
      // Remove all whitespace (spaces, newlines, tabs, etc.)
      const pemContents = cleanKey.replace(/\s/g, '');
      
     
      
      // Convert base64 to ArrayBuffer
      const binaryDer = atob(pemContents);
      const binaryDerArray = new Uint8Array(binaryDer.length);
      for (let i = 0; i < binaryDer.length; i++) {
        binaryDerArray[i] = binaryDer.charCodeAt(i);
      }

      

      // Import the public key
      const cryptoKey = await window.crypto.subtle.importKey(
        'spki',
        binaryDerArray.buffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        false,
        ['encrypt']
      );


      // Encrypt the candidate ID
      const encoder = new TextEncoder();
      const data = encoder.encode(candidateId.toString());
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        cryptoKey,
        data
      );

      // Convert to base64
      const encryptedArray = new Uint8Array(encrypted);
      const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));

      return encryptedBase64;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
}

export default VoteAPI;
