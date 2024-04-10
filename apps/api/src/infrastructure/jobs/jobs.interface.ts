export interface IGenericJobOptions {
  jobId?: string;
  removeOnComplete?: boolean;
}

export interface IJobService {
  addJob<T>(
    queueName: string,
    jobName: string,
    data: T,
    opts?: IGenericJobOptions,
  ): Promise<void>;
}
