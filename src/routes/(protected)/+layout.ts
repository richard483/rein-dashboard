import { redirect } from '@sveltejs/kit';
import { getAccessToken } from '$lib/modules/shared/api/client';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  const token = getAccessToken();

  if (!token) {
    throw redirect(302, '/login');
  }

  return {};
};
