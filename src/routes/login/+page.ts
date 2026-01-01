import { redirect } from '@sveltejs/kit';
import { getAccessToken } from '$lib/modules/shared/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const token = getAccessToken();

  // If already authenticated, redirect to home
  if (token) {
    throw redirect(302, '/');
  }

  return {};
};
