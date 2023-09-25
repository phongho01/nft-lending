/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useOnClickOutside } from 'usehooks-ts';
import ReactLoading from 'react-loading';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  getStakedByUser,
  calculateRepayment,
  sliceAddress,
  convertOfferDataToSign,
  generateOfferSignature,
  liquidateLoan,
  parseMetamaskError,
} from '@src/utils';
import { ONE_DAY, OrderStatus, FormType } from '@src/constants';
import { submitVote, getVote } from '@src/api/vote.api';
import styles from '../styles.module.scss';

const XDC_SCAN = import.meta.env.VITE_XDC_SCAN;

export default function Form({ item, onClose, type }) {
  const ref = useRef(null);
  const rate = useSelector((state) => state.rate.rate);
  const account = useSelector((state) => state.account);

  const [commitLoading, setCommitLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepted, setIsAccepted] = useState();
  const [isAuthorized, setIsAuthorized] = useState(true);

  const calculatePercentVote = (input, total) => {
    return ((input * 100) / total).toFixed(2);
  };

  const handleSubmitVote = async (vote) => {
    if (isAccepted !== undefined) return;
    try {
      const voteData = {
        voter: account.address,
        orderHash: item.hash,
        isAccepted: vote,
      };

      const { offerData, signatureData } = convertOfferDataToSign({
        ...item,
        creator: account.address,
        expiration: ONE_DAY * 7,
      });

      const signature = await generateOfferSignature(offerData, signatureData);
      signatureData.signature = signature;
      voteData.signature = signatureData;

      const { data } = await submitVote(voteData);
      toast.success('Vote successfully!');
      setIsAccepted(vote);
      item.vote = data;
    } catch (error) {
      toast.error('An error has been occurred!');
    }
  };

  const handleLiquidate = async () => {
    try {
      setCommitLoading(true);
      const tx = await liquidateLoan(item.hash);
      await tx.wait();
      toast.success('Liquidate loan successfully');
      setCommitLoading(false);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setCommitLoading(false);
      const txError = parseMetamaskError(error);
      toast.error(txError.context);
    }
  };

  const fetchInitData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getVote({ voter: account.address, orderHash: item.hash });
      const balance = await getStakedByUser(account.address, { blockTag: item.vote.blockNumber });
      if (data.length > 0) {
        setIsAccepted(data[0].isAccepted);
      } else {
        setIsAccepted();
      }
      setIsAuthorized(balance != 0);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useOnClickOutside(ref, () => onClose());

  useEffect(() => {
    fetchInitData();
  }, [account.address]);

  return (
    <div className={styles['form-container']}>
      <Toaster position="top-center" reverseOrder={false} />
      {commitLoading && (
        <div className="screen-loading-overlay">
          <ReactLoading type="spinningBubbles" color="#ffffff" height={60} width={60} />
        </div>
      )}
      <div className={styles.form} ref={ref}>
        <Icon icon="material-symbols:close" className={styles['close-btn']} onClick={() => onClose()} />
        {isLoading ? (
          <div className="react-loading-item mb-60 mt-60">
            <ReactLoading type="bars" color="#fff" height={100} width={120} />
          </div>
        ) : (
          <>
            <div className={styles.row}>
              <div className={styles.section}>
                <img src={item.metadata.image} alt="NFT Image" />
                <div className={styles.note}>Borrower will be received loan if &gt; 75% accepted.</div>
              </div>
              <div className={styles.section}>
                <div className={styles.info}>
                  <div className={styles.label}>Name: </div>
                  <div className={styles.value}>{item.metadata.name}</div>
                </div>
                <div className={styles.info}>
                  <div className={styles.label}>Collection: </div>
                  <div className={styles.value}>{item.metadata.collection}</div>
                </div>
                <div className={styles.info}>
                  <div className={styles.label}>Address: </div>
                  <div className={styles.value}>
                    <span>{sliceAddress(item.nftAddress)}</span>
                    <Link to={`${XDC_SCAN}/address/${item.nftAddress}`} target="_blank">
                      <Icon icon="uil:edit" />
                    </Link>
                  </div>
                </div>
                <div className={styles.info}>
                  <div className={styles.label}>Borrower: </div>
                  <div className={styles.value}>
                    <span>{sliceAddress(item.creator)}</span>
                    <Link to={`${XDC_SCAN}/address/${item.creator}`} target="_blank">
                      <Icon icon="uil:edit" />
                    </Link>
                  </div>
                </div>
                <div className={styles.info}>
                  <div className={styles.label}>Amount: </div>
                  <div className={styles.value}>
                    {item.offer} {account.currency}
                  </div>
                </div>
                <div className={styles.info}>
                  <div className={styles.label}>Duration: </div>
                  <div className={styles.value}>{item.duration} days</div>
                </div>
                <div className={styles.info}>
                  <div className={styles.label}>Repayment: </div>
                  <div className={styles.value}>
                    {calculateRepayment(item.offer, item.rate, item.duration)} {account.currency}
                  </div>
                </div>
                <div className={styles.info}>
                  <div className={styles.label}>APR: </div>
                  <div className={styles.value}>{item.rate}%</div>
                </div>
                <div className={styles.info}>
                  <div className={styles.label}>Float price: </div>
                  <div className={styles.value}>
                    {item.floorPrice} {account.currency}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.section}>
                <div
                  className={`${styles.chart} ${styles['chart-accept']}`}
                  style={{
                    width: `${calculatePercentVote(item.vote.accepted, item.vote.total)}%`,
                  }}
                >
                  {calculatePercentVote(item.vote.accepted, item.vote.total)}%
                </div>
                <div
                  className={`${styles.chart} ${styles['chart-reject']}`}
                  style={{
                    width: `${calculatePercentVote(item.vote.rejected, item.vote.total)}%`,
                  }}
                >
                  {calculatePercentVote(item.vote.rejected, item.vote.total)}%
                </div>
              </div>
              <div className={`${styles.section} ${styles['section-btn']} `}>
                {type === FormType.EDIT ? (
                  <>
                    {item.status === OrderStatus.FILLED ? (
                      <button className={styles['accept-btn']} onClick={handleLiquidate}>
                        Liquidate
                      </button>
                    ) : isAuthorized ? (
                      <>
                        <button
                          className={styles['accept-btn']}
                          disabled={isAccepted === false}
                          onClick={() => handleSubmitVote(true)}
                        >
                          <span>
                            {isAccepted === true ? 'You ' : ''} Accept{isAccepted === true ? 'ed' : ''}
                          </span>
                          {isAccepted === true && <Icon icon="material-symbols:check" />}
                        </button>
                        <button
                          className={styles['reject-btn']}
                          disabled={isAccepted === true}
                          onClick={() => handleSubmitVote(false)}
                        >
                          <span>
                            {isAccepted === false ? 'You ' : ''} Reject{isAccepted === false ? 'ed' : ''}
                          </span>
                          {isAccepted === false && <Icon icon="gridicons:cross" />}
                        </button>
                      </>
                    ) : (
                      <div>You are unauthorized to vote this order. </div>
                    )}
                  </>
                ) : (
                  <>
                    <button className={styles['accept-btn']} disabled={true}>
                      <span>Accept</span>
                    </button>
                    <button className={styles['reject-btn']} disabled={true}>
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
