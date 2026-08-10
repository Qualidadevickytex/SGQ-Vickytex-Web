/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DriveService, DriveFileMetadata } from '../google/drive.service';
import { StorageProvider } from './storage.service';

/**
 * Google Drive implementation of StorageProvider
 */
export class GoogleDriveProvider implements StorageProvider {
  name = 'GoogleDrive';

  async listarArquivos(folderId: string, accessToken: string): Promise<DriveFileMetadata[]> {
    return DriveService.listarArquivos(folderId, accessToken);
  }

  async obterMetadados(fileId: string, accessToken: string): Promise<DriveFileMetadata> {
    return DriveService.obterMetadados(fileId, accessToken);
  }

  async upload(
    blob: Blob,
    fileName: string,
    mimeType: string,
    parentFolderId: string | null,
    accessToken: string
  ): Promise<string> {
    return DriveService.upload(blob, fileName, mimeType, parentFolderId, accessToken);
  }

  async abrirPDF(fileId: string, accessToken: string): Promise<string> {
    return DriveService.abrirPDF(fileId, accessToken);
  }

  async moverParaObsoletos(fileId: string, obsoleteFolderId: string, accessToken: string): Promise<boolean> {
    return DriveService.moverParaObsoletos(fileId, obsoleteFolderId, accessToken);
  }

  gerarLinks(fileId: string): { viewUrl: string; downloadUrl: string } {
    return DriveService.gerarLinks(fileId);
  }
}
