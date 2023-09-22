/* eslint-disable react/prop-types */
import { useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles.module.scss';
import jazzicon from '@metamask/jazzicon';
import { Link } from 'react-router-dom';

export default function Account({ account: { address } }) {
  const avatarRef = useRef();

  useEffect(() => {
    const element = avatarRef.current;
    if (element && address) {
      const addr = address.slice(2, 10);
      const seed = parseInt(addr, 16);
      const icon = jazzicon(20, seed);
      if (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      element.appendChild(icon);
    }
  }, [address, avatarRef]);

  return (
    <div className={styles['account-wrap']}>
      <Link to="/profile/history">
        <Icon icon="bx:user" fontSize={24} cursor="pointer" />
      </Link>
      <div className={styles['account-address']}>
        <div ref={avatarRef}></div>
        <span>{`${address.slice(0, 5)} ... ${address.slice(-4)}`}</span>
      </div>
    </div>
  );
}
