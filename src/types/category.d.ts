export type Category = {
  _id: string;
  name: string;
  __v?: string | number;
  createdAt?: string;
  updatedAt?: string;
};

export type NewCategory = {
  _id?: string;
  name: string;
};
