import { useQuery } from '@tanstack/react-query';
import { recordsService } from '@/services/records.service';

export function useRecords() {
  return useQuery({
    queryKey: ['records'],
    queryFn: recordsService.getAll,
  });
}
