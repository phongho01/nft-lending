import { useState, useEffect } from 'react';
import { HiSwitchVertical } from 'react-icons/hi';
import { InlineIcon } from '@iconify/react';
import { useSelector } from 'react-redux';
import ReactLoading from 'react-loading';
import { formatNumber, getNativeBalance } from '@src/utils';
import { WXDC_ADDRESS } from '@src/constants'
import { ethers } from 'ethers';
import styles from '../styles.module.scss';

export default function Swap() {
  const account = useSelector((state) => state.account);

  const [isLoading, setIsLoading] = useState(true);

  const [fromToken, setFromToken] = useState({
    img: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Ethereum-ETH-icon.png',
    symbol: 'XCR',
    address: WXDC_ADDRESS,
    balance: 0,
  });

  const [toToken, setToToken] = useState({
    img: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    symbol: 'wXCR',
    address: ethers.constants.AddressZero,
    balance: account.balance,
  });

  const [inputData, setInputData] = useState({
    pay: 1,
    rate: 1,
    receive: 1,
  });

  const handleChange = (e) => {
    const newInputData = { ...inputData, [e.target.name]: e.target.value };
    if (e.target.name === 'pay' || e.target.name === 'rate') {
      newInputData.receive = formatNumber(newInputData.pay * newInputData.rate, 18);
    } else if (e.target.name === 'receive') {
      newInputData.rate = formatNumber(newInputData.receive / newInputData.pay, 18);
    }

    setInputData(newInputData);
  };

  const handleSwitchToken = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleSubmit = async () => {
    try {
      console.log('submit');
    } catch (error) {
      console.error('error', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getNativeBalance(account.address).then((xcr) => {
      setFromToken({ ...fromToken, balance: xcr });
      setIsLoading(false);
    })
    .catch(err => {
      console.log('init', err);
      setIsLoading(false);
    });

  }, []);

  return (
    <div className={styles['swap-container']}>
      {isLoading && (
        <div className={styles.loading}>
          <ReactLoading type="spinningBubbles" color="#ffffff" height={60} width={60} />
        </div>
      )}
      <div className={styles.title}>OTC</div>
      <div className={styles.inputControl}>
        <div className={styles.label}>
          <span>Pay</span>
          <span className={styles['from-balance']}>
            <InlineIcon icon="mdi:wallet-outline" fontSize={12} color="rgba(235, 235, 245, 0.5)" />
            <div>
              {fromToken.balance} {fromToken.symbol}
            </div>
          </span>
        </div>
        <div className={styles.inputWrap}>
          <input type="number" value={inputData.pay} name="pay" onChange={handleChange} required />
          <div className={styles.tokenWrap}>
            <img src={fromToken.img} />
            <span>{fromToken.symbol}</span>
          </div>
        </div>
      </div>
      <div className={styles.switchToken}>
        <HiSwitchVertical size={24} color="#fff" cursor="pointer" onClick={handleSwitchToken} />
      </div>
      <div className={styles.inputControl}>
        <div className={styles.label}>
          <span>Receive</span>
          <span className={styles['from-balance']}>
            <InlineIcon icon="mdi:wallet-outline" fontSize={12} color="rgba(235, 235, 245, 0.5)" />
            <div>
              {toToken.balance} {toToken.symbol}
            </div>
          </span>
        </div>
        <div className={styles.inputWrap}>
          <input type="number" value={inputData.receive} name="receive" onChange={handleChange} required />
          <div className={styles.tokenWrap}>
            <img src={toToken.img} />
            <span>{toToken.symbol}</span>
          </div>
        </div>
      </div>
      <button type="button" className={styles.submitBtn} onClick={handleSubmit}>
        Swap
      </button>
    </div>
  );
}
