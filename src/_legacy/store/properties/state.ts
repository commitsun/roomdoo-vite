import type { PropertyStateInterface } from '.';

function state(): PropertyStateInterface {
  return {
    properties: [],
    activeProperty: null,
  };
}

export default state;
