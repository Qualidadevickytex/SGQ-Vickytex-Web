/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseService, ApiResponse, PaginatedResponse } from '../../api.types';
import { ErrorHandler } from '../../errorHandler';
import { cacheService } from '../../cache.service';
import { getAllDocs, getDocById, createDocWithId, updateDocData, deleteDocById } from '../../../firebase/firestore';

export abstract class BaseRepository<T extends { id: string }> implements BaseService<T> {
  protected abstract collectionName: string;

  protected abstract getLocalData(): T[];
  protected abstract saveLocalData(data: T[]): void;
  protected abstract mapRecord(record: any): T;
  protected abstract mapToPayload(data: Partial<T>): any;
  protected abstract getSearchFilter(query: string): any;
  protected abstract localSearchMatch(item: T, query: string): boolean;

  async findAll(): Promise<ApiResponse<T[]>> {
    const timestamp = new Date().toISOString();
    try {
      const docs = await getAllDocs<any>(this.collectionName);
      if (Array.isArray(docs)) {
        const mapped = docs.map((rec: any) => this.mapRecord(rec));
        const seen = new Set<string>();
        const unique = mapped.filter((a: T) => {
          if (!a || !a.id || seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });

        if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
          console.log(`[FIREBASE] projectId: sgq-vickytex-web`);
          console.log(`[FIREBASE] Firestore conectado: true`);
          console.log(`[FIREBASE] collection: ${this.collectionName}`);
          console.log(`[FIREBASE] documentos encontrados: ${unique.length}`);
          console.log(`[FIREBASE] fallback mock utilizado: NÃO`);
        }

        return { success: true, data: unique, timestamp };
      }
    } catch (dbErr: any) {
      console.error(`[FIREBASE] Error fetching collection "${this.collectionName}":`, dbErr);
      return { success: false, data: [], error: ErrorHandler.handle(dbErr), timestamp };
    }
    return { success: true, data: [], timestamp };
  }

  async findById(id: string): Promise<ApiResponse<T | null>> {
    const timestamp = new Date().toISOString();
    try {
      const docData = await getDocById<any>(this.collectionName, id);
      if (docData) {
        const mapped = this.mapRecord(docData);
        return { success: true, data: mapped, timestamp };
      }
      return { success: true, data: null, timestamp };
    } catch (dbErr: any) {
      console.error(`[FIREBASE] Error fetching document "${this.collectionName}/${id}":`, dbErr);
      return { success: false, data: null, error: ErrorHandler.handle(dbErr), timestamp };
    }
  }

  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    const timestamp = new Date().toISOString();
    const id = data.id || `${this.collectionName}-${Date.now()}`;
    const payload = this.mapToPayload({ ...data, id });

    try {
      await createDocWithId(this.collectionName, id, payload);
      const mapped = this.mapRecord({ id, ...payload });
      cacheService.invalidate(`${this.collectionName}:all`);
      return { success: true, data: mapped, timestamp };
    } catch (dbErr: any) {
      console.error(`[BaseRepository] Firestore create failed for ${this.collectionName}:`, dbErr);
      const fallbackItem = { ...data, id } as T;
      return { success: false, data: fallbackItem, error: ErrorHandler.handle(dbErr), timestamp };
    }
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    const timestamp = new Date().toISOString();
    const payload = this.mapToPayload(data);

    try {
      await updateDocData(this.collectionName, id, payload);
      cacheService.invalidate(`${this.collectionName}:all`);
      cacheService.invalidate(`${this.collectionName}:${id}`);
      const mapped = this.mapRecord({ ...data, id });
      return { success: true, data: mapped, timestamp };
    } catch (dbErr: any) {
      console.error(`[BaseRepository] Firestore update failed for ${this.collectionName}/${id}:`, dbErr);
      const fallbackItem = { ...data, id } as T;
      return { success: false, data: fallbackItem, error: ErrorHandler.handle(dbErr), timestamp };
    }
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    const timestamp = new Date().toISOString();
    try {
      await deleteDocById(this.collectionName, id);
      cacheService.invalidate(`${this.collectionName}:all`);
      cacheService.invalidate(`${this.collectionName}:${id}`);
      return { success: true, data: true, timestamp };
    } catch (dbErr: any) {
      console.error(`[BaseRepository] Firestore delete failed for ${this.collectionName}/${id}:`, dbErr);
      return { success: false, data: false, error: ErrorHandler.handle(dbErr), timestamp };
    }
  }


  subscribe(_callback: (event: any) => void): () => void {
    return () => {};
  }

  async search(query: string): Promise<ApiResponse<T[]>> {
    const timestamp = new Date().toISOString();
    try {
      const q = query.toLowerCase();
      const filtered = this.getLocalData().filter(item => this.localSearchMatch(item, q));
      return { success: true, data: filtered, timestamp };
    } catch (error) {
      return { success: false, data: [], error: ErrorHandler.handle(error), timestamp };
    }
  }

  async count(): Promise<ApiResponse<number>> {
    const timestamp = new Date().toISOString();
    try {
      const allRes = await this.findAll();
      const total = allRes.success && Array.isArray(allRes.data) ? allRes.data.length : this.getLocalData().length;
      return { success: true, data: total, timestamp };
    } catch (error) {
      return { success: false, data: 0, error: ErrorHandler.handle(error), timestamp };
    }
  }

  async paginate(page: number, limit: number): Promise<ApiResponse<PaginatedResponse<T>>> {
    const timestamp = new Date().toISOString();
    try {
      const allRes = await this.findAll();
      const local = allRes.success ? allRes.data : this.getLocalData();
      const totalItems = local.length;
      const totalPages = Math.ceil(totalItems / limit);
      const start = (page - 1) * limit;
      const items = local.slice(start, start + limit);
      return {
        success: true,
        data: {
          items,
          page,
          perPage: limit,
          totalItems,
          totalPages,
        },
        timestamp,
      };
    } catch (error) {
      return {
        success: false,
        data: { items: [], page: 1, perPage: limit, totalItems: 0, totalPages: 0 },
        error: ErrorHandler.handle(error),
        timestamp,
      };
    }
  }
}
