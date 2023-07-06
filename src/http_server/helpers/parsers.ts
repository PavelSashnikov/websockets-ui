export const incomingParser = (mess: Buffer): unknown => {
  const out = JSON.parse(mess.toString());
  try {
    const data = JSON.parse(out.data);
    return { ...out, data };
  } catch (error) {
    return { ...out };
  }
};

//TODO: add mess type
export const outgoingParser = (mess: {}): string => {
  return JSON.stringify(mess);
};
