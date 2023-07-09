import { ICommand } from '../types/types.js';

export const parseCommand = (command: ICommand) => {
  let parsedCommand = JSON.parse(command.toString());
  const parsedData = JSON.parse(parsedCommand.data);
  parsedCommand = {
    type: parsedCommand.type,
    data: parsedData,
    id: parsedCommand.id,
  };

  return parsedCommand;
};
