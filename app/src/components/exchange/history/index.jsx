/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { ERC20_ABI } from '@src/abi';
import { getTransactionByEvents, sliceHeadTail, provider } from '@src/utils';
import { WXDC_ADDRESS } from '@src/constants';
import styles from '../styles.module.scss';

const XDC_SCAN = import.meta.env.VITE_XDC_SCAN;

export default function Table() {
  const [historyTransactions, setHistoryTransactions] = useState([]);
  console.log(XDC_SCAN);

  const fetchTransactionHistory = async () => {
    try {
      const txs = await getTransactionByEvents(WXDC_ADDRESS, ERC20_ABI, 'Transfer');
      const eventList = [];
      for (let i = 0; i < txs.length; i++) {
        const timestamp = (await provider.getBlock(txs[i].blockNumber)).timestamp;
        const time = new Date(timestamp * 1000).toString().split('GMT')[0];
        eventList.push({ hash: txs[i].transactionHash, time, ...txs[i].args });
      }
      setHistoryTransactions(eventList);
    } catch (error) {
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
        <div className={styles['table-list-item-body']}>
          {historyTransactions && historyTransactions.length > 0 ? (
            historyTransactions.map((item, index) => (
              <div className={styles['table-list']} key={index}>
                <Link to={`${XDC_SCAN}/txs/${item.hash}`} target="_blank" className={styles['table-list-item']}>
                  {sliceHeadTail(item.hash, 8)}
                </Link>
                <div className={styles['table-list-item']}>
                  {sliceHeadTail(item.from === ethers.constants.AddressZero ? item.to : item.from, 8)}
                </div>
                <div className={styles['table-list-item']}>
                  {formatHexValue(item.value._hex)} {item.from === ethers.constants.AddressZero ? 'XDC' : 'wXDC'}
                </div>
                <div className={`${styles['table-list-item']} text-center`}>
                  <Icon icon="ep:right" fontSize={16} />
                </div>
                <div className={styles['table-list-item']}>
                  {formatHexValue(item.value._hex)} {item.from === ethers.constants.AddressZero ? 'wXDC' : 'XDC'}
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
      </div>
    </div>
  );
}
