import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
const pinataSDK = require('@pinata/sdk');
import config from 'src/config';

@Injectable()
export class IpfsService {
  async upload(data: any) {
    try {
      const pinata = new pinataSDK({
        pinataApiKey: config.ENV.PINATA_API_KEY,
        pinataSecretApiKey: config.ENV.PINATA_API_SECRET_KEY,
      });

      const { IpfsHash } = await pinata.pinJSONToIPFS(data);
      return IpfsHash;
    } catch (_e) {
      throw new BadRequestException('Error when upload file to IPFS');
    }
  }
}
