/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StorageService } from './storage.service';
import { GoogleDriveProvider } from './googleDrive.provider';

// Register standard Google Drive Provider
StorageService.registerProvider(new GoogleDriveProvider());

export * from './storage.service';
export * from './googleDrive.provider';
