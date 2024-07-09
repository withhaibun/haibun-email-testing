import { AStepper, IHasOptions, OK, TNamed, TWorld } from '@haibun/core/build/lib/defs.js';
import { actionNotOK, getStepperOption, stringOrError } from '@haibun/core/build/lib/util/index.js';
import { checkDmarc, checkDmarcField } from './lib/dmarc.js';
import { emailAuthenticate, emailSpf } from './lib/mailauth.js';
import 'dotenv/config'; // FIXME This may not be the best approach
import { fetchOne, moveMessage, updateMessageFlags } from './lib/imap.js';
import { getPolicy, validateMx } from './lib/mta.js';

const EMAIL_SERVER = 'EMAIL_SERVER';
const EMAIL_MESSAGE = 'EMAIL_MESSAGE';

const EmailTestingStepper = class EmailTestingStepper extends AStepper implements IHasOptions {
  knownPolicy = undefined;
  emailServer: undefined | string;
  options = {
    [EMAIL_SERVER]: {
      desc: 'Target email server',
      parse: (input: string) => stringOrError(input),
    },
  };
  async setWorld(world: TWorld, steppers: AStepper[]) {
    super.setWorld(world, steppers);
    this.world = world;
    this.emailServer = getStepperOption(this, EMAIL_SERVER, this.world.extraOptions);
  }
  async getPolicy() {
    const res = await getPolicy(this.emailServer, this.knownPolicy);
    return res;
  }

  steps = {
    dmarcExists: {
      gwta: `DMARC record exists`,
      action: async () => {
        return checkDmarc(this.emailServer!);
      },
    },
    dmarcExistsFor: {
      gwta: `DMARC record exists for {domain}`,
      action: async ({ domain }: TNamed) => {
        return await checkDmarc(domain!);
      },
    },
    dmarcHas: {
      gwta: `DMARC field {field} is defined`,
      action: async ({ field }: TNamed) => {
        return await checkDmarcField(this.emailServer!, field);
      },
    },
    dmarcHasFor: {
      gwta: `DMARC field {field} is defined for {domain}`,
      action: async ({ domain, field }: TNamed) => {
        return await checkDmarcField(this.emailServer!, field);
      },
    },
    checkMTASTS: {
      gwta: `domain's mail server agent strict transfer security is valid`,
      action: async () => {
        const { policy } = await this.getPolicy();

        for (const mx of policy.mx) {
          const policyMatch = validateMx(mx, policy);
          if (!policy.id) {
            return actionNotOK(policyMatch);
          }
          if (policy.mx && !policyMatch) {
            return actionNotOK(`unlisted MX ${mx}`);
          }
        }

        if (policy.mode !== 'enforce') {
          return actionNotOK(`not using enforce mode`);
        }

        return OK;
      },
    },
    validateMXHostname: {
      gwta: `domain has a valid mail exchange record`,
      action: async () => {
        const { policy } = await this.getPolicy();
        const res = await validateMx(this.emailServer, policy);

        return res === true ? OK : actionNotOK(res);
      },
    },
    authenticate: {
      gwta: `authenticate`,
      action: async () => {
        return await emailAuthenticate();
      },
    },
    spf: {
      gwta: `spf`,
      action: async () => {
        return await emailSpf();
      },
    },
    fetchMessage: {
      gwta: `fetch message {uid} from {mailbox}`,
      action: async ({ uid, mailbox }: TNamed) => {
        return await fetchOne(mailbox!, parseInt(uid!, 10));
      },
    },
    changeMessageFlags: {
      gwta: `change message {uid} flags in {mailbox} to {flags}`,
      action: async ({ uid, mailbox, flags }: TNamed) => {
        return await updateMessageFlags(mailbox!, parseInt(uid!, 10), flags!.split(','));
      },
    },
    moveMessage: {
      gwta: `move message {uid} {mailbox} to {where}`,
      action: async ({ uid, mailbox, where }: TNamed) => {
        return await moveMessage(mailbox!, parseInt(uid!, 10), where!);
      },
    },
  };
};

export default EmailTestingStepper;
