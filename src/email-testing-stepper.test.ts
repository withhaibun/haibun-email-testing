import { testWithDefaults } from '@haibun/core/build/lib/test/lib';
import { getStepperOptionName } from '@haibun/core/build/lib/util';
import { DEF_PROTO_DEFAULT_OPTIONS } from '@haibun/core/build/lib/run';
import EmailTestingStepper from './email-testing-stepper';

const domain = 'google.com';

describe('MTA', () => {
  it('MTA STS', async () => {
    const protoOptions = { extraOptions: { [getStepperOptionName(EmailTestingStepper, 'EMAIL_SERVER')]: domain, }, options: DEF_PROTO_DEFAULT_OPTIONS }
    const { ok } = await testWithDefaults(`domain's mail server agent strict transfer security is valid`, [EmailTestingStepper], protoOptions);
    expect(ok).toBe(true);
  });
});

describe('DMARC', () => {
  it('Has a valid dmarc record', async () => {
    const protoOptions = { extraOptions: { [getStepperOptionName(EmailTestingStepper, 'EMAIL_SERVER')]: domain, }, options: DEF_PROTO_DEFAULT_OPTIONS }
    const { ok } = await testWithDefaults(`DMARC record exists`, [EmailTestingStepper], protoOptions);
    expect(ok).toBe(true);
  });
  it('DMARC rua is defined', async () => {
    const protoOptions = { extraOptions: { [getStepperOptionName(EmailTestingStepper, 'EMAIL_SERVER')]: domain, }, options: DEF_PROTO_DEFAULT_OPTIONS }
    const { ok } = await testWithDefaults(`DMARC field rua is defined`, [EmailTestingStepper], protoOptions);
    expect(ok).toBe(true);
  });
});