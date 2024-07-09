import { OK } from '@haibun/core/build/lib/defs.js';
import { actionNotOK } from '@haibun/core/build/lib/util/index.js';

import dmarc from 'dmarc-solution';

export async function checkDmarc(emailServer: string) {
  try {
    const record = await dmarc.fetch(emailServer);
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
