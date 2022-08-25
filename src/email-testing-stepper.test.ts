import { testWithDefaults } from '@haibun/core/build/lib/test/lib';
import { getStepperOptionName } from '@haibun/core/build/lib/util';
import { DEF_PROTO_DEFAULT_OPTIONS } from '@haibun/core/build/lib/run';
import EmailTestingStepper from './email-testingstepper';

describe('email-testing', () => {
  it.only('MTA STS', async () => {
    const protoOptions = { extraOptions: { [getStepperOptionName(EmailTestingStepper, 'EMAIL_SERVER')]: 'gmail.com', }, options: DEF_PROTO_DEFAULT_OPTIONS }
    const { ok } = await testWithDefaults(`domain's mail server agent strict transfer security is valid`, [EmailTestingStepper], protoOptions);
    expect(ok).toBe(true);
  });
});