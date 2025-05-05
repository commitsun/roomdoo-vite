export interface ApiRestErrorInterface {
  response: {
    config: {
      url: string;
    };
    data: {
      code:number;
      description: string;
      name:string;
    };
    status: number;
  }
}
