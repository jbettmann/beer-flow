export type Users = {
  _id: number;
  fullName: string;
  username: string;
  password: string;
  email: string;
  breweries: string[];
  __v: number;
  accessToken: string;
  refreshToken: string;
};

export type AuthContextType = {
  user: Users | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};
