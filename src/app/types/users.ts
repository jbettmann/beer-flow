export type Users = {
  _id: number;
  fullName: string;
  username: string;
  password: string;
  email: string;
  breweries: number[];
  __v: number;
};

export type User = {
  id: number;
  name: string;
};

export type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};
