import { testWithDefaults } from '@haibun/core/build/lib/test/lib';
import { getStepperOptionName } from '@haibun/core/build/lib/util';
import { DEF_PROTO_DEFAULT_OPTIONS } from '@haibun/core/build/lib/run';
import EmailWildduckStepper from './email-wildducker-stepper';

describe('email-wildduck', () => {
  it.only('MTA STS', async () => {
    const protoOptions = { extraOptions: { [getStepperOptionName(EmailWildduckStepper, 'EMAIL_SERVER')]: 'gmail.com', }, options: DEF_PROTO_DEFAULT_OPTIONS }
    const { ok } = await testWithDefaults(`domain's mail server agent strict transfer security is valid`, [EmailWildduckStepper], protoOptions);
    expect(ok).toBe(true);
  });
});