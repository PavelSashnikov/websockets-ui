export const incomingParser = (mess: Buffer): unknown => {
  const out = JSON.parse(mess.toString());
  const data = JSON.parse(out.data);
  return { ...out, data };
};

//TODO: add mess type
export const outgoingParser = (mess: {}): string => {
  return JSON.stringify(mess);
};
