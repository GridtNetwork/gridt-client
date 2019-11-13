import { MovementInterval, User } from 'src/api';

export class MovementModel {
   constructor(
   public id: string,
   public name: string,

   public subscribed: boolean,
   public shortDescription: string,
   public description: string,
){}
}