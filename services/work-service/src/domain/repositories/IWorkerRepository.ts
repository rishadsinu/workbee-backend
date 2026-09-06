import { WorkerStatus } from "../../infrastructure/database/models/WorkerSchema";
import { NewWorker, Worker } from "../entities/Worker";

export interface IWorkerRepository {
    save(worker: NewWorker): Promise<Worker>;
    findByEmail(email: string): Promise<Worker | null>;
    findById(id: string): Promise<Worker | null>;
    getNewAppliers(page: number, limit: number, search: string): Promise<{ workers: Worker[]; total: number }>;
    getAllWorkers(page: number, limit: number, search: string, status?: string): Promise<{ workers: Worker[]; total: number }>;

    getWorkersCount(): Promise<number>;
    findByIds(ids: string[]): Promise<Worker[]>;

    updateProfileImage(userId: string, imageUrl: string, publicId: string): Promise<boolean>;
    updatePassword(workerId: string, hashedPassword: string): Promise<void>;
    updateWorkerProfile(userId: string, data: { name: string; phone: string; location: string; bio: string; }): Promise<Worker | null>;

    // addReviewField(workerId:string):Promise<boolean>
    countPendingAppliers(): Promise<number>;
    countCreatedBetween(status: WorkerStatus, start: Date, end: Date): Promise<number>;

}


