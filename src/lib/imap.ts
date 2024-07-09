import { OK } from '@haibun/core/build/lib/defs';
import { actionNotOK } from '@haibun/core/build/lib/util';

const dmarc = require('dmarc-solution');

export async function checkDmarc(emailServer: string) {
  try {
    const record = await dmarc.fetch(this.emailServer);
    return OK;
  } catch (e: any) {
    return actionNotOK(e.getMessage());
  }
}

export async function checkDmarcField(emailServer: string, field: any) {
  try {
    const record = await dmarc.fetch(emailServer);
    if (!record.tags[field]) {
      return actionNotOK(`field ${field} doesn't exist`);
    }
    return OK;
  } catch (e: any) {
    return actionNotOK(e.getMessage());
  }
}
