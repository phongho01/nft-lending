import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ethers } from 'ethers';
import { setAccount } from '@src/redux/features/accountSlice';
import { setRate } from '@src/redux/features/rateSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getBalance } from '@src/utils/contracts/erc20';
import { CHAIN_ID } from '@src/constants';
import Header from './header';
import Footer from './footer';
import ConnectMetamask from './connect-metamask';

export default function UserLayout() {
  const rate = useSelector((state) => state.rate);
  const account = useSelector((state) => state.account);
  const [network, setNetwork] = useState(window.ethereum.networkVersion);

  const dispatch = useDispatch();

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
    } else {
      const balance = await getBalance(accounts[0]);
      dispatch(
        setAccount({
          address: accounts[0].toLowerCase(),
          balance: balance,
          currency: 'wXDC',
        })
      );
    }
  };

  const requireSwitchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x32' }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x32',
                rpcUrl: 'https://erpc.xinfin.network',
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }
  };

  const fetchRate = () => {
    const socket = new WebSocket('wss://ws.coincap.io/prices?assets=ethereum');
    socket.addEventListener('message', function (event) {
      const data = JSON.parse(event.data);
      if (data.ethereum) {
        const price = data.ethereum;
        dispatch(
          setRate({
            price,
            rate: rate.price != 0 ? Math.floor(Number(((price - rate.price) / rate.price).toFixed(7)) * 1e7) : 0.2,
          })
        );
      }
    });
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
          console.error(err);
        });

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('networkChanged', function (networkId) {
        setNetwork(networkId);
      });
      requireSwitchNetwork();
      fetchRate();

      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      provider.getNetwork().then(({ chainId }) => setNetwork(chainId));
    } else {
      alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html');
    }
  }, [window.ethereum]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Header handleAccountsChanged={handleAccountsChanged} requireSwitchNetwork={requireSwitchNetwork} />
      <div className="container">
        {account.address && network == CHAIN_ID ? (
          <Outlet />
        ) : (
          <ConnectMetamask handleAccountsChanged={handleAccountsChanged} requireSwitchNetwork={requireSwitchNetwork} />
        )}
      </div>
      <Footer />
    </>
  );
}
