/* eslint-disable react/prop-types */
import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import ReactLoading from 'react-loading';
import { ethers } from 'ethers';
import { getTokenBoundAccount, ERC721Contract, ERC20Contract, getBalance } from '@src/utils';
import { WEAPON_NFT_ADDRESS, GOLD_ERC20_ADDRESS, SILVER_ERC20_ADDRESS } from '@src/constants';

import styles from './styles.module.scss';

export default function TokenBoundAccountCard({ item, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [assets, setAssets] = useState({
    nfts: [],
    tokens: [],
  });

  const ref = useRef(null);

  const handleFetchAssets = async () => {
    try {
      const tbaAddress = await getTokenBoundAccount(item.edition);
      console.log('tbaAddress', tbaAddress)
      const listNFTs = [1, 2, 3, 4];
      const erc721 = ERC721Contract(WEAPON_NFT_ADDRESS);
      console.log('ownerOf', await Promise.all(listNFTs.map((tokenId) => erc721.ownerOf(tokenId))))
      const tokenURIs = await Promise.all(listNFTs.map((tokenId) => erc721.tokenURI(tokenId)));
      const nftData = (await Promise.all(tokenURIs.map((uri) => axios.get(uri)))).map((res) => res.data);

      const goldContract = ERC20Contract(GOLD_ERC20_ADDRESS);
      const silverContract = ERC20Contract(SILVER_ERC20_ADDRESS);

      const [wXDC, GOLD, SILVER] = await Promise.all([
        getBalance(tbaAddress),
        goldContract.balanceOf(tbaAddress),
        silverContract.balanceOf(tbaAddress),
      ]);

      const tokensData = [
        {
          name: 'wXDC',
          value: wXDC,
        },
        {
          name: 'GOLD',
          value: Number(ethers.utils.formatEther(GOLD)).toFixed(2),
        },
        {
          name: 'SILVER',
          value: Number(ethers.utils.formatEther(SILVER)).toFixed(2),
        },
      ];

      setAssets({ tokens: tokensData, nfts: nftData });
      console.log({ tokens: tokensData, nfts: nftData });

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useOnClickOutside(ref, () => onClose());

  useEffect(() => {
    handleFetchAssets();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className="screen-loading-overlay">
          <ReactLoading type="spinningBubbles" color="#ffffff" height={60} width={60} />
        </div>
      )}
      <div className={styles.form} ref={ref}>
        <div className={styles.left}>
          <div className={styles['item-name']}>{item.name}</div>
          <img src={item.image} />
        </div>
        <div className={styles.right}>
          <div className={styles['tab-list']}>
            <div className={`${styles.tab} ${activeTab === 1 ? styles.active : ''}`} onClick={() => setActiveTab(1)}>
              Collectibles
            </div>
            <div className={`${styles.tab} ${activeTab === 2 ? styles.active : ''}`} onClick={() => setActiveTab(2)}>
              Assets
            </div>
          </div>
          <div className={styles['list-assets']}>
            {activeTab === 1 ? (
              <div className={styles['list-nfts']}>
                {assets.nfts.map((item, index) => (
                  <img src={item.image} key={index} />
                ))}
              </div>
            ) : (
              <div className={styles['list-tokens']}>
                {assets.tokens.map((item, index) => (
                  <div className={styles['token-item']} key={index}>
                    <span>{item.name}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
