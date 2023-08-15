export type Users = {
  _id: string;
  fullName: string;
  username: string;
  password: string;
  email: string;
  breweries: string[];
  __v: number;
  image: string;
  accessToken: string;
  refreshToken: string;
};

export type AuthContextType = {
  user: Users | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};
