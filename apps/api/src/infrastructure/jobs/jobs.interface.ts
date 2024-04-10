export interface IJobService {
  addJob<T>(queueName: string, jobName: string, data: T): Promise<void>;
}
