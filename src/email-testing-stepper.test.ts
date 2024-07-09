import { describe, it, expect } from 'vitest';

import { testWithDefaults } from '@haibun/core/build/lib/test/lib.js';
import { asFeatures } from '@haibun/core/build/lib/resolver-features.js';

import { getStepperOptionName } from '@haibun/core/build/lib/util';
import { DEF_PROTO_OPTIONS } from '@haibun/core/build/lib/run.js';
import EmailTestingStepper from './email-testing-stepper.js';

const domain = 'google.com';

const protoOptions = {
  ...DEF_PROTO_OPTIONS,
  extraOptions: {
    [getStepperOptionName(EmailTestingStepper, 'EMAIL_SERVER')]: domain,
  },
};
describe('MTA', () => {
  it('MTA STS', async () => {
    const features = asFeatures([
      {
        path: '/features/record.feature',
        content: `domain's mail server agent strict transfer security is valid`,
      },
    ]);
    const { ok } = await testWithDefaults(
      features,
      [EmailTestingStepper],
      protoOptions,
    );
    expect(ok).toBe(true);
  });
});

describe('DMARC', () => {
  it('Has a valid dmarc record', async () => {
    const features = asFeatures([
      { path: '/features/record.feature', content: `DMARC record exists` },
    ]);
    const { ok } = await testWithDefaults(
      features,
      [EmailTestingStepper],
      protoOptions,
    );
    expect(ok).toBe(true);
  });
  it('DMARC rua is defined', async () => {
    const features = asFeatures([
      {
        path: '/features/record.feature',
        content: `DMARC field rua is defined`,
      },
    ]);
    const { ok } = await testWithDefaults(
      features,
      [EmailTestingStepper],
      protoOptions,
    );
    expect(ok).toBe(true);
  });
});
