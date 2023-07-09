export interface ICommand {
  type: string;
  data: IRegUser;
  id: number;
}

export interface IRegUser {
  id?: string;
  name: string;
  password: string;
  error?: boolean;
  errorText?: string;
}
