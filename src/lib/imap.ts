import { ImapFlow } from 'imapflow';

import { OK } from '@haibun/core/build/lib/defs.js';
import { actionNotOK } from '@haibun/core/build/lib/util/index.js';

const mailHost = process.env.MAIL_HOST;
const user = process.env.EMAIL;
const pass = process.env.PASSWORD;

const flowParams = () => {
  if (!mailHost || !user || !pass) {
    throw new Error('Missing environment variables');
  }
  return {
    host: mailHost,
    port: 993,
    logger: {
      log: () => {},
      debug: () => {},
      info: console.info,
      warn: console.warn,
      error: console.error,
    },
    secure: true,
    auth: {
      user,
      pass,
    },
  };
};

export const fetchOne = async (mailbox: string, uid: number) => {
  const client = new ImapFlow(flowParams());
  await client.connect();

  try {
    const lock = await client.getMailboxLock(mailbox);

    try {
      const nuid = `${uid}`; // Convert uid to string
      const message = await client.fetchOne(nuid, { uid: true });
    } finally {
      lock.release();
    }
  } catch (error) {
    return actionNotOK(error as any);
  } finally {
    await client.logout();
  }
  return OK;
};

export const updateMessageFlags = async (mailbox: string, uid: number, flags: string[]) => {
  const client = new ImapFlow(flowParams());
  await client.connect();

  try {
    const lock = await client.getMailboxLock(mailbox);

    try {
      const nuid = `${uid}`; // Convert uid to string
      const message = await client.fetchOne(nuid, { uid: true });
      if (message) {
        console.log(message, `Setting flags for UID ${nuid}:`, flags);
        // await client.messageFlagsSet({ uid: nuid }, flags);
        // Update your existing message as needed here
        // await updateExistingMessage(uid, { flags });
      } else {
        throw new Error(`Message ${uid} not found`);
      }
    } finally {
      lock.release();
    }
  } catch (error) {
    return actionNotOK(error as any);
  } finally {
    await client.logout();
  }
  return OK;
};

export const moveMessage = async (mailbox: string, uid: number, destination: string) => {
  const client = new ImapFlow(flowParams());
  await client.connect();
  const nuid = `${uid}`;

  try {
    const lock = await client.getMailboxLock(mailbox);
    try {
      const message = await client.fetchOne(nuid, { source: true });
      if (message) {
        await client.messageMove(nuid, destination);
      } else {
        throw new Error(`Message ${uid} not found`);
      }
    } finally {
      lock.release();
    }
  } catch (error) {
    return actionNotOK(error as any);
  } finally {
    await client.logout();
  }
  return OK;
};
