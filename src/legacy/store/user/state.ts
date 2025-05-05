import type { UserStateInterface } from '.';

function state(): UserStateInterface {
  return {
    activeUser: null,
  };
}

export default state;
