/* eslint-disable @typescript-eslint/no-empty-function */
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Contract, JsonRpcProvider, ethers } from 'ethers';
import config from 'src/config';
import * as FACTORY_ABI from './abi/LendingPool.json';
import * as ERC20_ABI from './abi/ERC20.json';

@Injectable()
export class LendingPoolService implements OnModuleInit {
  private rpcProvider: JsonRpcProvider;
  private lendingPoolContract: Contract;

  constructor() {}

  onModuleInit() {
    this.rpcProvider = new JsonRpcProvider(config.ENV.NETWORK_RPC_URL);
    this.lendingPoolContract = new Contract(
      config.ENV.LENDING_POOL_ADDRESS,
      FACTORY_ABI,
      this.rpcProvider,
    );
  }

  async getStakedPerUser(
    account: string,
    options: Record<string, any>,
  ): Promise<number> {
    const userInfo = await this.lendingPoolContract.userInfo(account, {
      ...options,
    });
    return Number(ethers.formatEther(userInfo.amount));
  }

  async getTotalStaked(options: Record<string, any>) {
    const poolInfo = await this.lendingPoolContract.poolInfo({ ...options });
    return ethers.formatUnits(poolInfo.stakedSupply, 18);
  }

  async getBlockNumber() {
    return this.rpcProvider.getBlockNumber();
  }
}
