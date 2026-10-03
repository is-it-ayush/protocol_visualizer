import { registerProtocol } from '../core/registry';
import { uart } from './uart';
import { rs232 } from './rs232';
import { spi } from './spi';

registerProtocol(uart);
registerProtocol(rs232);
registerProtocol(spi);
