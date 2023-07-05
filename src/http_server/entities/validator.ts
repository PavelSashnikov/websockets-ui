import { IncomingMessage, OutgoingMessage } from './interface/message.ts';

export const validateUser = (data: IncomingMessage.Registration, index: number): OutgoingMessage.Registration => {
  let error = false;
  let errorText = '';
  if (!data.name || typeof data.name !== 'string' || !data.password || typeof data.password !== 'string') {
    error = true;
    errorText = 'data is not valid';
  }
  return { name: data.name, error, errorText, index };
};
