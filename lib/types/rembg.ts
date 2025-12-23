export interface RembgResponse {
  url: string;
  usage: {
    count: number;
    limit: number;
    remaining: number;
  };
}
