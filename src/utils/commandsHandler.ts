import { RawData } from 'ws';
import { ICommand } from '../types/types.js';

export const parseCommand = (command: RawData): ICommand => {
  let parsedCommand = JSON.parse(command.toString());
  const parsedData = JSON.parse(parsedCommand.data);
  parsedCommand = {
    type: parsedCommand.type,
    data: parsedData,
    id: parsedCommand.id,
  };

  return parsedCommand;
};

export const stringifyResponse = (response: ICommand) => {
  const strData = JSON.stringify(response.data);
  const strResponse = JSON.stringify({
    type: response.type,
    data: strData,
    id: response.id,
  });

  return strResponse;
};
