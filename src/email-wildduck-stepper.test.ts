import {testWithDefaults} from '@haibun/core/build/lib/test/lib';
import EmailWildduckStepper from './email-wildducker-stepper';

describe('email-wildduck', () => {
  it.only('MX', async () => {
    const feature = { path: '/features/test.feature', content: `Validate MX hostname` };
    const { result } = await testWithDefaults([feature], [EmailWildduckStepper]);
    expect(result.ok).toBe(true);
  });
  it.only('MTA STS', async () => {
    const feature = { path: '/features/test.feature', content: `Check MTA STS` };
    const { result } = await testWithDefaults([feature], [EmailWildduckStepper]);

    expect(result.ok).toBe(true);
  });
  it('authenticate', async () => {
    const feature = { path: '/features/test.feature', content: `authenticate` };
    const { result } = await testWithDefaults([feature], [EmailWildduckStepper]);

    expect(result.ok).toBe(true);
  });
  it('spf', async () => {
    const feature = { path: '/features/test.feature', content: `spf` };
    const { result } = await testWithDefaults([feature], [EmailWildduckStepper]);

    expect(result.ok).toBe(true);
  });
});