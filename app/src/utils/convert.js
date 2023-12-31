import { getParsedEthersError } from '@enzoferey/ethers-error-parser';

export const convertArrayToObject = (array, key = '_id') => {
  return array.reduce((pre, cur) => {
    return { ...pre, [cur[key]]: cur };
  }, {});
};

export const parseMetamaskError = (error) => {
  const txError = getParsedEthersError(error);
  if (!txError.context) {
    txError.context = 'An error has occurred!';
  } else if (txError.errorCode === 'REJECTED_TRANSACTION') {
    txError.context = 'User rejected to sign transaction!';
  }
  return txError;
};
