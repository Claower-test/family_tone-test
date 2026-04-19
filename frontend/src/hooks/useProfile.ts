import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
    enabled,
  });
}
