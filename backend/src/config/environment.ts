export const Environment = {
  SERVER_PORT: Number(process.env.SERVER_PORT || 3000),
  SOCKET_PORT: Number(process.env.SOCKET_PORT || 3001),
  SERVER_HOST: process.env.SERVER_HOST || 'http://localhost',

  // Redis Web socket client config
  REDIS_VOTE_HOST: process.env.REDIS_VOTE_HOST || 'localhost',
  REDIS_VOTE_PORT: Number(process.env.REDIS_VOTE_PORT || 6379),
  REDIS_VOTE_PASS: process.env.REDIS_VOTE_PASS,
  REDIS_VOTE_FAMILY: Number(process.env.REDIS_VOTE_FAMILY || 4),
  REDIS_VOTE_DB: Number(process.env.REDIS_VOTE_DB || 0),

  // Redis Order config
  REDIS_ORDER_HOST: process.env.REDIS_ORDER_HOST || 'localhost',
  REDIS_ORDER_PORT: Number(process.env.REDIS_ORDER_PORT || 6379),
  REDIS_ORDER_PASS: process.env.REDIS_ORDER_PASS,
  REDIS_ORDER_FAMILY: Number(process.env.REDIS_ORDER_FAMILY || 4),
  REDIS_ORDER_DB: Number(process.env.REDIS_ORDER_DB || 1),

  // OPERATOR ACCOUNT
  OPERATOR_ACCOUNT_PRIVATE_KEY: process.env.OPERATOR_ACCOUNT_PRIVATE_KEY,

  // Web3 host
  NETWORK_RPC_URL:
    process.env.NETWORK_RPC_URL || 'https://rpc.apothem.network/',
  WXDC_ADDRESS:
    process.env.WXDC_ADDRESS || '0xae506ec5eea42eab2dc94d7d04e2b32549e59df4',
  COLLECTION_ADDRESS:
    process.env.COLLECTION_ADDRESS ||
    '0x0cc14b1adced0804014449c18ddff71a426a1bd0',
  LENDING_POOL_ADDRESS:
    process.env.LENDING_POOL_ADDRESS ||
    '0xea17e98586fd542e0edc35bd50400e4045b72dc5',
  LOAN_ADDRESS:
    process.env.LOAN_ADDRESS || '0xcabf3a50b5cbe215354dec7c286ed26cd20f8f60',
  NETWORK_CHAIN_ID: process.env.NETWORK_CHAIN_ID || '51',
  IPFS_HOST: process.env.IPFS_HOST || 'https://gateway.ipfs.io/ipfs',
  PINATA_API_KEY: process.env.PINATA_API_KEY || '9bf70188a61a1447bd82',
  PINATA_API_SECRET_KEY:
    process.env.PINATA_API_SECRET_KEY ||
    '83523b16d1a3bbd87dc014a4e3e9cbe1f931487fbf9dc1d2286ac3062af68369',
};
