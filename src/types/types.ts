export interface ICommand {
  type: string;
  data: IRegUser;
  id: number;
}

interface IRegUser {
  name: string;
  password: string;
  error?: boolean;
  errorText?: string;
}
