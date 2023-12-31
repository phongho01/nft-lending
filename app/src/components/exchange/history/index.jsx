/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import ReactLoading from 'react-loading';
import { ERC20_ABI } from '@src/abi';
import { getTransactionByEvents, sliceHeadTail, provider } from '@src/utils';
import { WXDC_ADDRESS } from '@src/constants';
import styles from '../styles.module.scss';

const XDC_SCAN = import.meta.env.VITE_XDC_SCAN;

export default function Table() {
  const [historyTransactions, setHistoryTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactionHistory = async () => {
    try {
      setIsLoading(true);
      const [mintTxs, burntTxs] = await Promise.all([
        getTransactionByEvents(WXDC_ADDRESS, ERC20_ABI, 'Minted'),
        getTransactionByEvents(WXDC_ADDRESS, ERC20_ABI, 'Burnt'),
      ]);

      const txs = mintTxs.concat(burntTxs);
      const eventList = [];
      for (let i = 0; i < txs.length; i++) {
        const timestamp = (await provider.getBlock(txs[i].blockNumber)).timestamp;
        const time = new Date(timestamp * 1000).toString().split('GMT')[0];
        const obj = {
          hash: txs[i].transactionHash,
          time,
          address: txs[i].args.account,
          amount: txs[i].args.amount,
          name: txs[i].event,
          blockNumber: txs[i].blockNumber,
        };
        eventList.push(obj);
      }
      eventList.sort((a, b) => b.blockNumber - a.blockNumber);
      setHistoryTransactions(eventList);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('error', error);
    }
  };

  const formatHexValue = (amount) => {
    const value = ethers.utils.formatUnits(amount, 18);
    return (value * 100) / 100;
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  return (
    <div className={styles.history}>
      <div className={styles.table}>
        <div className={styles.heading}>Transactions History (Last 10,000 blocks)</div>
        <div className={styles['table-list']}>
          <div className={styles['table-list-item']}>Hash</div>
          <div className={styles['table-list-item']}>Address</div>
          <div className={styles['table-list-item']}>Pay</div>
          <div className={styles['table-list-item']}></div>
          <div className={styles['table-list-item']}>Receive</div>
          <div className={styles['table-list-item']}>Time</div>
        </div>
        {isLoading ? (
          <div
            className="react-loading-item"
            style={{ marginTop: '20px', marginBottom: '20px', paddingBottom: '40px' }}
          >
            <ReactLoading type="bars" color="#fff" height={100} width={120} />
          </div>
        ) : (
          <div className={styles['table-list-item-body']}>
            {historyTransactions && historyTransactions.length > 0 ? (
              historyTransactions.map((item, index) => (
                <div className={styles['table-list']} key={index}>
                  <Link to={`${XDC_SCAN}/tx/${item.hash}`} target="_blank" className={styles['table-list-item']}>
                    {sliceHeadTail(item.hash, 8)}
                  </Link>
                  <div className={styles['table-list-item']}>{sliceHeadTail(item.address, 8)}</div>
                  <div className={styles['table-list-item']}>
                    {formatHexValue(item.amount._hex)} {item.name === 'Minted' ? 'XCR' : 'wXCR'}
                  </div>
                  <div className={`${styles['table-list-item']} text-center`}>
                    <Icon icon="ep:right" fontSize={16} />
                  </div>
                  <div className={styles['table-list-item']}>
                    {formatHexValue(item.amount._hex)} {item.name === 'Minted' ? 'wXCR' : 'XCR'}
                  </div>
                  <div className={styles['table-list-item']}>{item.time}</div>
                </div>
              ))
            ) : (
              <div className={styles['no-data']}>
                <span>No data</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
