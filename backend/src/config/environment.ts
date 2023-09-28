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
  NETWORK_RPC_URL: process.env.NETWORK_RPC_URL || 'https://erpc.xinfin.network',
  WXDC_ADDRESS:
    process.env.WXDC_ADDRESS || '0xfea8b79984920f9d3b02207f17501015d1bdee60',
  COLLECTION_ADDRESS:
    process.env.COLLECTION_ADDRESS ||
    '0xf485b0f0140e416556b32a8390771baddb1561cd',
  LENDING_POOL_ADDRESS:
    process.env.LENDING_POOL_ADDRESS ||
    '0x6db42573fa618f805982cac3f90179ae8acace28',
  LOAN_ADDRESS:
    process.env.LOAN_ADDRESS || '0x44f389e68b54eb11ab1f026fdd9be7b5a9fa0cfd',
  NETWORK_CHAIN_ID: process.env.NETWORK_CHAIN_ID || '50',
  IPFS_HOST: process.env.IPFS_HOST || 'https://gateway.ipfs.io/ipfs',
  PINATA_API_KEY: process.env.PINATA_API_KEY || '9bf70188a61a1447bd82',
  PINATA_API_SECRET_KEY:
    process.env.PINATA_API_SECRET_KEY ||
    '83523b16d1a3bbd87dc014a4e3e9cbe1f931487fbf9dc1d2286ac3062af68369',
};
