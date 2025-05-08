export type Notifications = {
  allow: boolean;
  newBeerRelease: {
    email: boolean;
    push: boolean;
  };
  beerUpdate: {
    email: boolean;
    push: boolean;
  };
  [key: string]: any;
};
