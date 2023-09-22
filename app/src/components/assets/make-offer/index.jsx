/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ReactLoading from 'react-loading';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { getOffersByOrder } from '@src/api/offer.api';
import { calculateRepayment, sliceAddress, calculateRealPrice } from '@src/utils';
import Table from './table';
import Form from './form';
import styles from './styles.module.scss';

const DXC_SCAN = import.meta.env.VITE_DXC_SCAN;

export default function MakeOffer({ item }) {
  const { hash } = useParams();
  const rate = useSelector((state) => state.rate.rate);
  const currency = useSelector((state) => state.account.currency);

  const [offerList, setOfferList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      const { data } = await getOffersByOrder(hash, { status: 0 });
      setOfferList(data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles['make-offer']}>
        <div className={`${styles.section} ${styles['section-image']}`}>
          <div>
            <div className={styles['real-price']}>
              Real price:{' '}
              <b>
                {calculateRealPrice(item.offer * 1.2, rate, 1e7)} {currency}
              </b>
            </div>
            <div className={styles['real-price-source']}>Fetch price from Oracle</div>
          </div>
          <img src={item.metadata.image} alt={item.metadata.name} />
        </div>
        <div className={styles.section}>
          <div className={styles['heading']}>Proposed offer from owner</div>
          <div className={styles.info}>
            <div className={styles.label}>Name: </div>
            <div className={styles.value}>{item.metadata.name}</div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>Collection: </div>
            <div className={styles.value}>{item.metadata.collection}</div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>Token ID: </div>
            <div className={styles.value}>{item.nftTokenId}</div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>Address: </div>
            <div className={styles.value}>
              <span>{sliceAddress(item.nftAddress)}</span>
              <Link to={`${DXC_SCAN}/address/${item.nftAddress}`} target="_blank">
                <Icon icon="uil:edit" />
              </Link>
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>Borrower: </div>
            <div className={styles.value}>
              <span>{sliceAddress(item.creator)}</span>
              <Link to={`${DXC_SCAN}/address/${item.creator}`} target="_blank">
                <Icon icon="uil:edit" />
              </Link>
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>Amount: </div>
            <div className={styles.value}>
              {item.offer} {currency}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>Duration: </div>
            <div className={styles.value}>{item.duration} days</div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>Repayment: </div>
            <div className={styles.value}>
              {calculateRepayment(item.offer, item.rate, item.duration)} {currency}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>APR: </div>
            <div className={styles.value}>{item.rate}%</div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>Float price: </div>
            <div className={styles.value}>
              {item.floorPrice} {currency}
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <Form order={item} fetchOffers={fetchOffers} />
        </div>
      </div>
      {isLoading ? (
        <div className="react-loading-item">
          <ReactLoading type="bars" color="#fff" height={100} width={120} />
        </div>
      ) : (
        <Table title="Offers received" data={offerList} creator={item.creator} />
      )}
    </div>
  );
}
