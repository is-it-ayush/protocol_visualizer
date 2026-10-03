import { registerProtocol } from '../core/registry';
import { uart } from './uart';
import { rs232 } from './rs232';

registerProtocol(uart);
registerProtocol(rs232);
