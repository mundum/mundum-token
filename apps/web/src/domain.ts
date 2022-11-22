import { createDomain } from 'effector';

const domain = {
  service: createDomain('service'),
  core: createDomain('core'),
  ui: createDomain('ui'),
  nav: createDomain('nav'),
  dev: createDomain('dev'),
  meta: createDomain('meta'),
};

export default domain;
