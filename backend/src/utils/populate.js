const { getAccountById } = require('./account');

const toPlain = (doc) => (doc && typeof doc.toObject === 'function' ? doc.toObject() : doc);

const populateConversationParticipants = async (
  conversation,
  select = 'username displayName avatar status lastSeen callRate'
) => {
  const convObj = toPlain(conversation);
  const accounts = {};
  for (const p of convObj.participants || []) {
    const id = p.toString();
    if (!accounts[id]) accounts[id] = await getAccountById(id, select);
  }
  convObj.participants = convObj.participants.map((p) => {
    const id = p.toString();
    return accounts[id] ? { ...accounts[id], _id: id } : p;
  });
  return convObj;
};

const populateMessageSender = async (message, select = 'username displayName avatar') => {
  const msgObj = toPlain(message);
  const sender = await getAccountById(msgObj.sender, select);
  if (sender) msgObj.sender = { ...sender, _id: msgObj.sender.toString() };
  return msgObj;
};

const populateMessageReactions = async (message, select = 'username displayName avatar') => {
  const msgObj = toPlain(message);
  if (msgObj.reactions?.length) {
    msgObj.reactions = await Promise.all(
      msgObj.reactions.map(async (r) => {
        const user = await getAccountById(r.user, select);
        return { ...r, user: user ? { ...user, _id: r.user.toString() } : r.user };
      })
    );
  }
  return msgObj;
};

const populateMessage = async (message, select = 'username displayName avatar') => {
  let msgObj = toPlain(message);
  const sender = await getAccountById(msgObj.sender, select);
  if (sender) msgObj.sender = { ...sender, _id: msgObj.sender.toString() };
  if (msgObj.reactions?.length) {
    msgObj.reactions = await Promise.all(
      msgObj.reactions.map(async (r) => {
        const user = await getAccountById(r.user, select);
        return { ...r, user: user ? { ...user, _id: r.user.toString() } : r.user };
      })
    );
  }
  return msgObj;
};

const populateMessages = async (messages, select = 'username displayName avatar') => {
  return Promise.all(messages.map((msg) => populateMessage(msg, select)));
};

const populateCall = async (call, select = 'username displayName avatar') => {
  const callObj = toPlain(call);
  const [caller, receiver] = await Promise.all([
    getAccountById(callObj.caller, select),
    getAccountById(callObj.receiver, select),
  ]);
  if (caller) callObj.caller = { ...caller, _id: callObj.caller.toString() };
  if (receiver) callObj.receiver = { ...receiver, _id: callObj.receiver.toString() };
  return callObj;
};

const populateCalls = async (calls, select = 'username displayName avatar') => {
  return Promise.all(calls.map((call) => populateCall(call, select)));
};

module.exports = {
  populateConversationParticipants,
  populateMessageSender,
  populateMessageReactions,
  populateMessage,
  populateMessages,
  populateCall,
  populateCalls,
  toPlain,
};
