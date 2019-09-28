import { Movements } from '../../src/api/model/movements'
import { MovementInterval } from '../../src/api/model/movementInterval'

export const movements: Movements = [
    {
      name: 'Flossing';
      subscribed?: false;
      leaders?: {'';'';'';''};
      shortDescription: 'We floss daily to keep our gums happy.';
      description?: '';
      interval: MovementInterval = {0;1;0;0};
    },
    {
      name: 'Running: 3k/3d';
      subscribed?: false;
      leaders?: {'';'';'';''};
      shortDescription: 'Get into those running shoes! The world is your treadmill. Run 3k every 3 days.';
      description?: '';
      interval: MovementInterval = {0;3;0;0};
    },
    {
      name: 'Guitar Heroes';
      subscribed?: false;
      leaders?: {{0;'';'';};{0;'';'';};{0;'';'';};{0;'';'';};};
      shortDescription: 'Take out your guitar and start strumming/picking/whatever takes your fancy. Let\'s become guitar heroes by playing daily!';
      description?: '';
      interval: MovementInterval = {0;1;0;0};
    },
    {
      name: 'Meatless Mondays';
      subscribed?: false;
      leaders?: {{0;'';'';};{0;'';'';};{0;'';'';};{0;'';'';};};
      shortDescription: 'Go meatless one day a week for your health and the health of our planet!';
      description?: '';
      interval: MovementInterval = {0;0;1;0};
    },
    {
      name: 'Calisthenics Workout';
      subscribed?: false;
      leaders?: {{0;'';'';};{0;'';'';};{0;'';'';};{0;'';'';};};
      shortDescription: 'Not feeling like hitting the gym, but still want a workout? Hit the calisthenics park and get fit!';
      description?: '';
      interval: MovementInterval = {0;3;0;0};
    },
    {
      name: 'Study Buddies';
      subscribed?: false;
      leaders?: {{0;'';'';};{0;'';'';};{0;'';'';};{0;'';'';};};
      shortDescription: 'Need some extra support getting your work done? We study 1h-2h outside of school every day.';
      description?: '';
      interval: MovementInterval = {0;1;0;0};
    },
    {
      name: 'Bike/Public Transport Day';
      subscribed?: false;
      leaders?: {{0;'';'';};{0;'';'';};{0;'';'';};{0;'';'';};};
      shortDescription: 'Take your bike or public transport instead of your car one day a week, to reduce traffic jams and GHG emissions.';
      description?: '';
      interval: MovementInterval = {0;0;1;0};
    },
  ];