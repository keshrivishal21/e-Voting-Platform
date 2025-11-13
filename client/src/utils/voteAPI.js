import { apiFetch } from './apiClient';

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
      return await apiFetch('/vote/elections/ongoing', { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async getElectionPublicKey(electionId) {
    try {
      return await apiFetch(`/vote/election/${electionId}/public-key`, { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async requestVotingOTP(electionId) {
    try {
      return await apiFetch('/vote/request-otp', { method: 'POST', body: { electionId } });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async verifyOTP(electionId, otp) {
    try {
      return await apiFetch('/vote/verify-otp', { method: 'POST', body: { electionId, otp } });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async getBallot(electionId) {
    try {
      return await apiFetch(`/vote/ballot/${electionId}`, { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async castVote(electionId, encryptedVotes) {
    try {
      return await apiFetch('/vote/cast', { method: 'POST', body: { electionId, encryptedVotes } });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async checkVoteStatus(electionId) {
    try {
      return await apiFetch(`/vote/status/${electionId}`, { method: 'GET' });
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async encryptVote(candidateId, publicKey) {
    try {
      
      const pemHeader = "-----BEGIN PUBLIC KEY-----";
      const pemFooter = "-----END PUBLIC KEY-----";
      
      let cleanKey = publicKey.trim();
      
      if (cleanKey.includes(pemHeader)) {
        cleanKey = cleanKey.replace(pemHeader, '');
      }
      if (cleanKey.includes(pemFooter)) {
        cleanKey = cleanKey.replace(pemFooter, '');
      }
      
      const pemContents = cleanKey.replace(/\s/g, '');
      
     
      
      const binaryDer = atob(pemContents);
      const binaryDerArray = new Uint8Array(binaryDer.length);
      for (let i = 0; i < binaryDer.length; i++) {
        binaryDerArray[i] = binaryDer.charCodeAt(i);
      }

      

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


      const encoder = new TextEncoder();
      const data = encoder.encode(candidateId.toString());
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        cryptoKey,
        data
      );

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
