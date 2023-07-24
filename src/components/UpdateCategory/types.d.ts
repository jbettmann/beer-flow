type RefsType = {
  name: React.RefObject<HTMLInputElement>;
};
import { Category, NewCategory } from "@/app/types/category";

interface FormValues {
  _id?: string;
  name: string;
  __v?: number;
}
interface ErrorValues {
  name?: string;
}
