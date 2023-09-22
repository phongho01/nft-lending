import { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useSelector } from 'react-redux';
import { getOrders } from '@src/api/order.api';
import Card from '@src/components/common/card';
import ListCollateralForm from '@src/components/common/list-collateral-form';
import { COLLATERAL_FORM_TYPE, OrderStatus } from '@src/constants';
import styles from './styles.module.scss';

export default function Collateral() {
  const account = useSelector((state) => state.account);

  const [isLoading, setIsLoading] = useState(true);
  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState();

  const fetchOrderList = async () => {
    try {
      const { data } = await getOrders({ creator: account.address, status: OrderStatus.OPENING });
      setOrderList(data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('error', error);
    }
  };

  useEffect(() => {
    fetchOrderList();
  }, [account.address]);
  
  return (
    <div className={styles.container}>
      {selectedOrder && (
        <ListCollateralForm item={selectedOrder} onClose={setSelectedOrder} type={COLLATERAL_FORM_TYPE.VIEW} />
      )}
      <div className={styles.heading}>Your collaterals</div>
      {isLoading ? (
        <div className="react-loading-item">
          <ReactLoading type="bars" color="#fff" height={100} width={120} />
        </div>
      ) : orderList.length > 0 ? (
        <div className={styles['list-nfts']}>
          {orderList.map((order, index) => (
            <Card key={index} item={order.metadata} action={{ text: 'List collateral', handle: () => setSelectedOrder(order) }} />
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
