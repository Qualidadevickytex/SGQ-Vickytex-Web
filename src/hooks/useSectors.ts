import { useState, useEffect } from 'react';
import { SectorType } from '../types/department';
import { getSectors, SECTORS } from '../utils/mockData';
import { SystemSettingsRepository } from '../services/database/repositories/systemSettings.repository';

export function useSectors(): SectorType[] {
  const [sectors, setSectors] = useState<SectorType[]>(() => getSectors());

  useEffect(() => {
    // Initial fetch from storage / cache
    setSectors(getSectors());

    // Subscribe to Firestore SystemSettings changes for real-time reactivity
    const unsub = SystemSettingsRepository.subscribe((records) => {
      const secDoc = records.find(r => r.id === 'sgq_vickytex_setores');
      if (secDoc && Array.isArray(secDoc.items) && secDoc.items.length > 0) {
        setSectors(secDoc.items);
      }
    });

    // Listen to local sync event
    const handleLocalUpdate = () => {
      setSectors(getSectors());
    };
    window.addEventListener('sgq_setores_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    return () => {
      unsub();
      window.removeEventListener('sgq_setores_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }, []);

  return sectors.length > 0 ? sectors : SECTORS;
}
