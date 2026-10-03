import { registerProtocol } from '../core/registry';
import { uart } from './uart';
import { rs232 } from './rs232';
import { spi } from './spi';
import { i2c } from './i2c';
import { can } from './can';

registerProtocol(uart);
registerProtocol(rs232);
registerProtocol(spi);
registerProtocol(i2c);
registerProtocol(can);
