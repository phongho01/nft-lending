import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { mintERC20, mintERC721, parseMetamaskError } from '@src/utils';
import styles from './styles.module.scss';

export default function Faucet() {
  const { pathname } = useLocation();

  const [address, setAddress] = useState('');

  const handleMintERC20 = async () => {
    try {
      await mintERC20(address);
      toast.success('Faucet 20 wXDC successfully. Please wait for state updated');
    } catch (error) {
      const txError = parseMetamaskError(error);
      toast.error(txError.context);
    }
  };

  const handleMintERC721 = async () => {
    try {
      await mintERC721(address);
      toast.success('Mint 5 NFTs successfully. Please wait for state updated');
    } catch (error) {
      const txError = parseMetamaskError(error);
      toast.error(txError.context);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-center" reverseOrder={false} />

      <div className={styles.content}>
        <div className={styles.title}>{pathname === '/wxcr-faucet' ? 'wXDC FAUCET' : 'NFT Faucet'}</div>
        <div className={styles.description}>
          Fast and reliable. {pathname === '/wxcr-faucet' ? '20 wXDC/day' : '5 NFTs/day'}
        </div>
        <div className={styles['input-control']}>
          <input
            placeholder="Enter your wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button disabled={address === ''} onClick={pathname === '/wxcr-faucet' ? handleMintERC20 : handleMintERC721}>
            {pathname === '/wxcr-faucet' ? 'Send wXDC' : 'Mint NFT'}
          </button>
        </div>
      </div>
    </div>
  );
}
