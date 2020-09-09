import { Movement } from './movement.model';
import { User } from './user.model';

export interface SwapEvent {
  date: Date;
  movement: Movement;
  user: User;
}
