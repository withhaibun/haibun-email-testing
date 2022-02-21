
const { authenticate } = require('mailauth');
const { dkimVerify } = require('mailauth/lib/dkim/verify');
const { spf } = require('mailauth/lib/spf');
const { getPolicy, validateMx } = require('mailauth/lib/mta-sts');


const gmail = 'gmail.com';

import { AStepper, IHasOptions, OK, TWorld } from "@haibun/core/build/lib/defs";
import { actionNotOK, getStepperOption, stringOrError } from '@haibun/core/build/lib/util';

const EMAIL_SERVER = 'EMAIL_SERVER';
const EMAIL_MESSAGE = 'EMAIL_MESSAGE';

const EmailWildduckStepper = class EmailWildduckStepper extends AStepper implements IHasOptions {
    //   requireDomains = [EMAIL_BOX, EMAIL_MESSAGE];
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
        this.emailServer = getStepperOption(this, EMAIL_SERVER, this.world.options) || "gmail-smtp-in.l.google.com";
    }
    async getPolicy() {
        // let knownPolicy = getCachedPolicy('gmail.com'); // optional
        const knownPolicy = undefined;
        const res = await getPolicy(gmail, knownPolicy);
        // if (res.policy.id !== knownPolicy?.id) {
        // policy has been updated, update cache
        // }
        return res;
    }

    steps = {
        checkMTASTS: {
            gwta: 'check MTA STS',
            action: async () => {
                const { policy } = await this.getPolicy();

                const policyMatch = validateMx(this.emailServer, policy);
                console.log('xx', policy, policyMatch);
                if (!policy.id) {
                    return actionNotOK(policyMatch);
                }


                if (policy.mode === 'enforce') {
                    // must use TLS
                }

                if (policy.mx && !policyMatch) {
                    // can't connect, unlisted MX
                }
                return OK;
            }
        },
        validateMXHostname: {
            gwta: `validate MX hostname`,
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
                console.log('🤑', JSON.stringify(dkim, null, 2));
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
                console.log(result.header);
                return OK;
            }
        }
    }
}

export default EmailWildduckStepper;