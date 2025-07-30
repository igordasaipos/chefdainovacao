import { useState, useEffect, useMemo, useCallback } from "react";

type FilterType = 'mais-votadas' | 'recentes';
type Ideia = any; // Using any to match existing type usage

export function useStableSort(ideias: Ideia[], filterType: FilterType) {
  const [sortSnapshot, setSortSnapshot] = useState<Ideia[]>([]);
  const [shouldUpdateSort, setShouldUpdateSort] = useState(true);

  // Function to trigger sort update
  const updateSortSnapshot = useCallback(() => {
    setShouldUpdateSort(true);
  }, []);

  // Create initial sort when ideias change or when explicitly requested
  useEffect(() => {
    if (shouldUpdateSort && ideias?.length > 0) {
      const sortedArray = [...ideias];
      
      switch (filterType) {
        case 'mais-votadas':
          sortedArray.sort((a, b) => b.votos - a.votos);
          break;
        case 'recentes':
          sortedArray.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
          break;
      }
      
      setSortSnapshot(sortedArray);
      setShouldUpdateSort(false);
    }
  }, [ideias, filterType, shouldUpdateSort]);

  // Update sort when filter changes
  useEffect(() => {
    updateSortSnapshot();
  }, [filterType, updateSortSnapshot]);

  // Stable sorted ideias with updated vote counts
  const stableSortedIdeias = useMemo(() => {
    if (!sortSnapshot.length || !ideias?.length) return [];
    
    // Map current ideias data to the snapshot order, preserving order but updating vote counts
    return sortSnapshot.map(snapshotIdeia => {
      const currentIdeia = ideias.find(idea => idea.id === snapshotIdeia.id);
      return currentIdeia || snapshotIdeia; // Use current data if available, fallback to snapshot
    }).filter(idea => ideias.some(currentIdeia => currentIdeia.id === idea.id)); // Filter out deleted ideas
  }, [sortSnapshot, ideias]);

  return {
    stableSortedIdeias,
    updateSortSnapshot
  };
}