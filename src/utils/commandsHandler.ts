import { RawData } from 'ws';
import { ICommand } from '../types/types.js';

export const parseCommand = <T>(command: RawData): ICommand<T> => {
  let parsedCommand = JSON.parse(command.toString());
  const parsedData = parsedCommand.data ? JSON.parse(parsedCommand.data) : '';
  parsedCommand = {
    type: parsedCommand.type,
    data: parsedData,
    id: parsedCommand.id,
  };

  return parsedCommand;
};

export const stringifyResponse = <T>(response: ICommand<T>) => {
  const strData = JSON.stringify(response.data);
  const strResponse = JSON.stringify({
    type: response.type,
    data: strData,
    id: response.id,
  });

  return strResponse;
};
