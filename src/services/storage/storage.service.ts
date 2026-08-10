/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DriveFileMetadata } from '../google/drive.service';

/**
 * Generic Storage Provider Interface
 */
export interface StorageProvider {
  name: string;
  listarArquivos(folderId: string, accessToken: string): Promise<DriveFileMetadata[]>;
  obterMetadados(fileId: string, accessToken: string): Promise<DriveFileMetadata>;
  upload(
    blob: Blob,
    fileName: string,
    mimeType: string,
    parentFolderId: string | null,
    accessToken: string
  ): Promise<string>;
  abrirPDF(fileId: string, accessToken: string): Promise<string>;
  moverParaObsoletos(fileId: string, obsoleteFolderId: string, accessToken: string): Promise<boolean>;
  gerarLinks(fileId: string): { viewUrl: string; downloadUrl: string };
}

/**
 * Orchestrator class that manages file storage across providers.
 * Easily extendable to AWS S3, SharePoint, or Azure Blob Storage in the future.
 */
class StorageServiceClass {
  private providers = new Map<string, StorageProvider>();
  private activeProviderName = 'GoogleDrive';

  /**
   * Register a new storage provider
   */
  registerProvider(provider: StorageProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Set active provider at runtime
   */
  setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Storage provider ${name} is not registered.`);
    }
    this.activeProviderName = name;
  }

  /**
   * Retrieve active provider instance
   */
  get activeProvider(): StorageProvider {
    const provider = this.providers.get(this.activeProviderName);
    if (!provider) {
      throw new Error(`Default storage provider ${this.activeProviderName} not found.`);
    }
    return provider;
  }

  // Abstracted Actions

  async listarArquivos(folderId: string, accessToken: string): Promise<DriveFileMetadata[]> {
    return this.activeProvider.listarArquivos(folderId, accessToken);
  }

  async obterMetadados(fileId: string, accessToken: string): Promise<DriveFileMetadata> {
    return this.activeProvider.obterMetadados(fileId, accessToken);
  }

  async upload(
    blob: Blob,
    fileName: string,
    mimeType: string,
    parentFolderId: string | null,
    accessToken: string
  ): Promise<string> {
    return this.activeProvider.upload(blob, fileName, mimeType, parentFolderId, accessToken);
  }

  async abrirPDF(fileId: string, accessToken: string): Promise<string> {
    return this.activeProvider.abrirPDF(fileId, accessToken);
  }

  async moverParaObsoletos(fileId: string, obsoleteFolderId: string, accessToken: string): Promise<boolean> {
    return this.activeProvider.moverParaObsoletos(fileId, obsoleteFolderId, accessToken);
  }

  gerarLinks(fileId: string): { viewUrl: string; downloadUrl: string } {
    return this.activeProvider.gerarLinks(fileId);
  }
}

export const StorageService = new StorageServiceClass();
export default StorageService;
