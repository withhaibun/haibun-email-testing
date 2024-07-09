import { OK } from '@haibun/core/build/lib/defs.js';

import { authenticate } from 'mailauth';
import { dkimVerify } from 'mailauth/lib/dkim/verify';
import { spf } from 'mailauth/lib/spf';

export async function emailAuthenticate() {
  const message = 'hello';
  const { dkim, spf, arc, dmarc, bimi, receivedChain, headers } = await authenticate(
    message, // either a String, a Buffer or a Readable Stream
    {
      // SMTP transmission options if available
      ip: '217.146.67.33', // SMTP client IP
      helo: 'uvn-67-33.tll01.zonevs.eu', // EHLO/HELO hostname
      sender: 'andris@ekiri.ee', // MAIL FROM address

      // Uncomment if you do not want to provide ip/helo/sender manually but parse from the message
      //trustReceived: true,

      // Server processing this message, defaults to os.hostname(). Inserted into Authentication headers
      mta: 'mx.ethereal.email',

      //  Optional  DNS resolver function (defaults to `dns.promises.resolve`)
      // resolver: async (name: any, rr: any) => await dns.promises.resolve(name, rr)
    },
  );
  // output authenticated message
  process.stdout.write(headers); // includes terminating line break
  process.stdout.write(message);
  return OK;
}

export async function emailSpf() {
  let result = await spf({
    sender: 'andris@wildduck.email',
    ip: '217.146.76.20',
    helo: 'foo',
    mta: 'mx.myhost.com',
  });
  return OK;
}
