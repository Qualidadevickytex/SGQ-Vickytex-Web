/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Documento } from '../../types';
import { DocumentRepository } from '../firebase/repositories/document.repository';

/**
 * Serviço de Gestão de Documentos em 3 Camadas (Lista Mestra de POPs, ITs, Formulários, Manuais)
 * Integrado via Firebase Firestore
 */
export const documentService = {
  /**
   * Obtém todos os documentos cadastrados
   */
  async getDocuments(): Promise<Documento[]> {
    const res = await DocumentRepository.findAll();
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Salva, cria ou atualiza um documento via Firebase Firestore
   */
  async saveDocument(doc: Partial<Documento>): Promise<Documento | null> {
    if (doc.id) {
      const res = await DocumentRepository.update(doc.id, doc);
      if (res.success && res.data) {
        return res.data;
      }
    } else {
      const res = await DocumentRepository.create(doc);
      if (res.success && res.data) {
        return res.data;
      }
    }
    return null;
  }
};

export default documentService;
