/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useSelector } from 'react-redux';
import { getNfts } from '@src/api/nfts.api';
import Card from '@src/components/common/card';
import ListCollateralForm from '@src/components/common/list-collateral-form';
import TokenBoundAccountCard from '@src/components/common/token-bound-account-card';
import { COLLATERAL_FORM_TYPE, TOKEN_BOUND_ACCOUNT_NFT_ADDRESS } from '@src/constants';
import { ERC721Contract } from '@src/utils';
import styles from './styles.module.scss';

export default function Assets() {
  const account = useSelector((state) => state.account);

  const [isLoading, setIsLoading] = useState(true);
  const [listNFT, setListNFT] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState();
  const [selectedTokenBoundAccount, setSelectedTokenBoundAccount] = useState();

  const handleOnClose = (isRefetch = false) => {
    setSelectedNFT();
    setSelectedTokenBoundAccount();
    if (isRefetch) fetchNFTs();
  };

  const fetchNFTs = async () => {
    try {
      const { data } = await getNfts({
        owner: account.address,
        isAvailable: true,
      });
      const tbaNFt = await fetchTokenBoundAccount();
      if (tbaNFt) {
        data.push(tbaNFt);
      }
      setListNFT(data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('error', error);
    }
  };

  const fetchTokenBoundAccount = async () => {
    if (account.address) {
      const erc721 = ERC721Contract(TOKEN_BOUND_ACCOUNT_NFT_ADDRESS);
      const isOwnTBA = (await erc721.ownerOf(1)).toLowerCase() == account.address;
      if (isOwnTBA) {
        const tokenURI = await erc721.tokenURI(1);
        const { data } = await axios.get(tokenURI);
        return {
          collectionAddress: TOKEN_BOUND_ACCOUNT_NFT_ADDRESS,
          collectionName: erc721.name(),
          collectionSymbol: erc721.symbol(),
          isAvailable: true,
          metadata: { ...data, isTokenBoundAccount: true },
          owner: account.address,
          tokenId: 1,
          tokenURI,
        };
      }
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [account.address]);

  return (
    <div className={styles.container}>
      {selectedNFT && (
        <ListCollateralForm item={selectedNFT} onClose={handleOnClose} type={COLLATERAL_FORM_TYPE.EDIT} />
      )}
      {selectedTokenBoundAccount && <TokenBoundAccountCard item={selectedTokenBoundAccount} onClose={handleOnClose} />}
      <div className={styles.heading}>Your assets</div>
      {isLoading ? (
        <div className="react-loading-item">
          <ReactLoading type="bars" color="#fff" height={100} width={120} />
        </div>
      ) : listNFT.length > 0 ? (
        <div className={styles['list-nfts']}>
          {listNFT.map((item, index) => (
            <Card
              key={index}
              item={item.metadata}
              action={{ text: 'List collateral', handle: setSelectedNFT }}
              handleTokenBoundAccount={setSelectedTokenBoundAccount}
            />
          ))}
        </div>
      ) : (
        <div className={styles['no-data']}>
          <span>No data</span>
        </div>
      )}
    </div>
  );
}
