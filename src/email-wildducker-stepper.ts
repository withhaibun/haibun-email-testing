
const { authenticate } = require('mailauth');
const { dkimVerify } = require('mailauth/lib/dkim/verify');
const { spf } = require('mailauth/lib/spf');
const { getPolicy, validateMx } = require('mailauth/lib/mta-sts');


import { AStepper, IHasOptions, OK, TWorld } from "@haibun/core/build/lib/defs";
import { actionNotOK, getStepperOption, stringOrError } from '@haibun/core/build/lib/util';

const EMAIL_SERVER = 'EMAIL_SERVER';
const EMAIL_MESSAGE = 'EMAIL_MESSAGE';

const EmailWildduckStepper = class EmailWildduckStepper extends AStepper implements IHasOptions {
    // requireDomains = [EMAIL_SERVER, EMAIL_MESSAGE];
    options = {
        [EMAIL_SERVER]: {
            desc: 'Target email server',
            parse: (input: string) => stringOrError(input)
        },
    };
    emailServer: any;
    async setWorld(world: TWorld, steppers: AStepper[]) {
        super.setWorld(world, steppers);
        this.world = world;
        this.emailServer = getStepperOption(this, EMAIL_SERVER, this.world.extraOptions);
    }
    async getPolicy() {
        const knownPolicy = undefined;
        const res = await getPolicy(this.emailServer, knownPolicy);
        return res;
    }

    steps = {
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
            }
        },
        validateMXHostname: {
            gwta: `domain has a valid mail exchange record`,
            action: async () => {
                const { policy } = await this.getPolicy();
                const res = await validateMx(this.emailServer, policy);

                return res === true ? OK : actionNotOK(res);
            }
        },
        authenticate: {
            gwta: `authenticate`,
            action: async () => {
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
                    }
                );
                // output authenticated message
                process.stdout.write(headers); // includes terminating line break
                process.stdout.write(message);
                return OK;
            }
        },
        spf: {
            gwta: `spf`,
            action: async () => {

                let result = await spf({
                    sender: 'andris@wildduck.email',
                    ip: '217.146.76.20',
                    helo: 'foo',
                    mta: 'mx.myhost.com'
                });
                return OK;
            }
        }
    }
}

export default EmailWildduckStepper;