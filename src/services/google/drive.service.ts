/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  parents?: string[];
  webViewLink?: string;
}

/**
 * Converts a base64 data URL to a Blob
 */
export function base64ToBlob(base64DataUrl: string): { blob: Blob; mimeType: string } {
  const parts = base64DataUrl.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return {
    blob: new Blob([uint8Array], { type: mimeType }),
    mimeType
  };
}

/**
 * Serviço de Integração com Google Drive (Vickytex POPs & PDF Repository)
 */
export const DriveService = {
  /**
   * Listar arquivos de uma determinada pasta do Drive
   */
  async listarArquivos(folderId: string, accessToken: string): Promise<DriveFileMetadata[]> {
    const query = `'${folderId}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,parents,webViewLink)`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao listar arquivos do Google Drive: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.files || [];
  },

  /**
   * Obter metadados detalhados de um arquivo específico pelo ID
   */
  async obterMetadados(fileId: string, accessToken: string): Promise<DriveFileMetadata> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,parents,webViewLink`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao obter metadados no Google Drive: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  },

  /**
   * Baixa o arquivo PDF do Google Drive e cria uma URL de objeto (ObjectURL) local para exibição segura no iFrame
   */
  async abrirPDF(fileId: string, accessToken: string): Promise<string> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(`Falha ao baixar arquivo do Drive (${fileId})`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  /**
   * Realiza o upload de um novo arquivo para uma pasta no Google Drive
   */
  async upload(
    blob: Blob,
    fileName: string,
    mimeType: string,
    parentFolderId: string | null,
    accessToken: string
  ): Promise<string> {
    const boundary = '-------vickytex_gdrive_upload_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      parents: parentFolderId ? [parentFolderId] : undefined,
      mimeType: mimeType
    };

    const reader = new FileReader();
    const arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });

    const arrayBuffer = await arrayBufferPromise;
    const encoder = new TextEncoder();
    
    const header = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n`;
    const footer = close_delim;

    const headerUint8 = encoder.encode(header);
    const footerUint8 = encoder.encode(footer);
    const bodyUint8 = new Uint8Array(arrayBuffer);

    const multipartBody = new Uint8Array(headerUint8.byteLength + bodyUint8.byteLength + footerUint8.byteLength);
    multipartBody.set(headerUint8, 0);
    multipartBody.set(bodyUint8, headerUint8.byteLength);
    multipartBody.set(footerUint8, headerUint8.byteLength + bodyUint8.byteLength);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro no upload para o Google Drive: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.id;
  },

  /**
   * Cria uma nova versão/revisão física de um arquivo existente no Google Drive
   */
  async novaRevisao(fileId: string, blob: Blob, mimeType: string, accessToken: string): Promise<boolean> {
    const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': mimeType
      },
      body: blob
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao subir nova revisão para o Google Drive: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return true;
  },

  /**
   * Move um arquivo para a pasta de obsoletos, gerenciando seus pais no Drive
   */
  async moverParaObsoletos(fileId: string, obsoleteFolderId: string, accessToken: string): Promise<boolean> {
    const fileMetadata = await this.obterMetadados(fileId, accessToken);
    const currentParents = fileMetadata.parents || [];
    
    const removeParentsQuery = currentParents.length > 0 ? `&removeParents=${currentParents.join(',')}` : '';
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${obsoleteFolderId}${removeParentsQuery}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao mover arquivo para obsoletos no Google Drive: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return true;
  },

  /**
   * Gera links amigáveis e estruturados para visualização de arquivos
   */
  gerarLinks(fileId: string): { viewUrl: string; downloadUrl: string } {
    return {
      viewUrl: `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`,
      downloadUrl: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    };
  },

  async getDriveFileMetadata(fileId: string): Promise<any> {
    return null;
  },

  async createFolder(
    folderName: string,
    parentFolderId: string | null,
    accessToken: string
  ): Promise<string> {
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao criar pasta no Google Drive: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.id;
  },

  async findFolderByName(
    folderName: string,
    parentFolderId: string | null,
    accessToken: string
  ): Promise<string | null> {
    let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao buscar pasta no Google Drive: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  },

  async findOrCreateFolder(
    folderName: string,
    parentFolderId: string | null,
    accessToken: string
  ): Promise<string> {
    const existingId = await this.findFolderByName(folderName, parentFolderId, accessToken);
    if (existingId) return existingId;
    return await this.createFolder(folderName, parentFolderId, accessToken);
  },

  async uploadFile(
    blob: Blob,
    fileName: string,
    mimeType: string,
    parentFolderId: string | null,
    accessToken: string
  ): Promise<string> {
    return this.upload(blob, fileName, mimeType, parentFolderId, accessToken);
  },

  isGoogleAccessToken(token?: string | null): boolean {
    if (!token || typeof token !== 'string') return false;
    const clean = token.trim();
    if (clean.length < 10) return false;
    if (clean.startsWith('mock_')) return false;
    // Firebase Auth ID tokens are JWTs starting with eyJ...
    if (clean.startsWith('eyJ')) return false;
    return true;
  },

  async getFileBlobUrl(fileId: string, accessToken: string): Promise<string> {
    return this.abrirPDF(fileId, accessToken);
  }
};

export const googleDriveService = DriveService;
export default DriveService;
