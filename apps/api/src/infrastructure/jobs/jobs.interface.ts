export interface IJobService {
  addJob(name: string, data: any): Promise<any>;
}
