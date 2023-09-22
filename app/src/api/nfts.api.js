import axios from '@src/config/axios.conf';
import { NFT_CONTRACT_ADDRESS } from '@src/constants' 

export const getNfts = ({ collectionAddress = NFT_CONTRACT_ADDRESS, ...params }) => {
  return axios.get(`/nfts`, {
    params: {
      collectionAddress,
      ...params,
    },
  });
};
