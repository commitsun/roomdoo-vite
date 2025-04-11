import type { ServiceStateInterface } from '.';

function state(): ServiceStateInterface {
  return {
    services: [],
    folioServices: [],
  };
}

export default state;
