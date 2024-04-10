export interface IGenericJobOptions {
  jobId?: string;
  removeOnComplete?: boolean;
  attempts?: number;
}

export interface IJobService {
  addJob<T>(
    queueName: string,
    jobName: string,
    data: T,
    opts?: IGenericJobOptions,
  ): Promise<void>;
}
