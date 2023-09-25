/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { getTransactionByEvents, sliceHeadTail } from '@src/utils';
import { WXDC_ADDRESS } from '@src/constants';
import { ERC20_ABI } from '@src/abi'
import styles from '../styles.module.scss';
import { ethers } from 'ethers';

export default function Table() {

  const [historyTransactions, setHistoryTransactions] = useState([])

  const fetchTransactionHistory = async () => {
    try {
      const txs = await getTransactionByEvents(WXDC_ADDRESS, ERC20_ABI, "Transfer")
      setHistoryTransactions(txs.map(item => ({ hash: item.transactionHash, ...item.args })))
      console.log(txs.map(async item => {
        const tx = await item.getTransaction()
        console.log(tx.value, await ethers.getBlock)
      }))
    } catch (error) {
      console.log('error', error);
    }
  }

  useEffect(() => {
    fetchTransactionHistory()
  }, [])

  return (
    <div className={styles.history}>
      <div className={styles.table}>
        <div className={styles.heading}>Transactions History (Last 10,000 blocks)</div>
        <div className={styles['table-list']}>
          <div className={styles['table-list-item']}>Hash</div>
          <div className={styles['table-list-item']}>Address</div>
          <div className={styles['table-list-item']}>Pay</div>
          <div className={styles['table-list-item']}>

          </div>
          <div className={styles['table-list-item']}>Receive</div>
          <div className={styles['table-list-item']}>Time</div>
        </div>
        {historyTransactions && historyTransactions.length > 0 ? (
        historyTransactions.map((item, index) => (
          <div className={styles['table-list']} key={index}>
            <div className={styles['table-list-item']}>{sliceHeadTail(item.hash, 8)}</div>
            <div className={styles['table-list-item']}>{sliceHeadTail(item.from === ethers.constants.AddressZero ? item.to : item.from, 8)}</div>
            <div className={styles['table-list-item']}>12 wXCR</div>
            <div className={`${styles['table-list-item']} text-center`}>
              <Icon icon="ep:right" fontSize={16} />
            </div>
            <div className={styles['table-list-item']}>12 XCR</div>
            <div className={styles['table-list-item']}>Thu, 07 September 2023 09:40:31</div>
          </div>
        ))
      ) : (
        <div className={styles['no-data']}>
          <span>No data</span>
        </div>
      )}
      </div>
    </div>
  );
}
