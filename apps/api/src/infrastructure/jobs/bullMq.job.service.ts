import { InjectQueue } from '@nestjs/bullmq';
import { IJobService } from './jobs.interface';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullJobService implements IJobService {
  constructor(@InjectQueue('bullmq-queue') readonly queue: Queue) {}

  async addJob(name: string, data: any) {
    return await this.queue.add(name, data);
  }
}
