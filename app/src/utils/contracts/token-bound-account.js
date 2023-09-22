import { ethers } from 'ethers';
import {
  TOKEN_BOUND_ACCOUNT_REGISTRY_ADDRESS,
  TOKEN_BOUND_ACCOUNT_IMPLEMENTATION_ADDRESS,
  TOKEN_BOUND_ACCOUNT_NFT_ADDRESS,
  CHAIN_ID,
  SALT,
} from '@src/constants';
import { TOKEN_BOUND_ACCOUNT_REGISTRY_ABI } from '@src/abi';

const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');

export const TokenBoundAccountRegistry = (
  contractAddress = TOKEN_BOUND_ACCOUNT_REGISTRY_ADDRESS,
  providerOrSigner = provider
) => {
  return new ethers.Contract(contractAddress, TOKEN_BOUND_ACCOUNT_REGISTRY_ABI, providerOrSigner);
};

export const getTokenBoundAccount = (tokenId) => {
  const contract = TokenBoundAccountRegistry();
  return contract.account(
    TOKEN_BOUND_ACCOUNT_IMPLEMENTATION_ADDRESS,
    CHAIN_ID,
    TOKEN_BOUND_ACCOUNT_NFT_ADDRESS,
    tokenId,
    SALT
  );
};
