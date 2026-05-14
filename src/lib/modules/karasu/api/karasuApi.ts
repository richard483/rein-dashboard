import { api } from '$lib/modules/shared/api/client';
import type {
	ApiResponse,
	ApiKeyInfo,
	CreateApiKeyRequest,
	CreateApiKeyResponse,
	HealthStatus,
	JwksResponse,
	ListApiKeysResponse,
	MachineTokenResponse,
	OAuthClient,
	OAuthClientListResponse,
	OAuthIntrospectionResponse,
	CreateOAuthClientRequest,
	UpdateOAuthClientRequest,
	UpdateOAuthClientPublicKeyRequest,
	Session
} from '$lib/modules/shared/types';

export async function getHealth(): Promise<HealthStatus> {
	return api.rawGet<HealthStatus>('/health');
}

export async function getLiveness(): Promise<HealthStatus> {
	return api.rawGet<HealthStatus>('/health/live');
}

export async function getReadiness(): Promise<HealthStatus> {
	return api.rawGet<HealthStatus>('/health/ready');
}

export async function getOAuthProviders(): Promise<string[]> {
	return api.get<string[]>('/auth/oauth/providers');
}

export async function getSessions(): Promise<{ sessions: Session[]; count: number }> {
	return api.get('/auth/sessions');
}

export async function deleteSession(sessionId: string): Promise<ApiResponse> {
	return api.delete(`/auth/sessions/${sessionId}`);
}

export async function logoutAll(): Promise<ApiResponse> {
	return api.post('/auth/logout/all');
}

export async function listApiKeys(): Promise<ListApiKeysResponse> {
	return api.get('/auth/api-keys');
}

export async function createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
	return api.post('/auth/api-keys', data);
}

export async function deleteApiKey(id: string): Promise<ApiResponse> {
	return api.delete(`/auth/api-keys/${id}`);
}

export async function listOAuthClients(): Promise<OAuthClientListResponse> {
	return api.get('/admin/oauth-clients');
}

export async function createOAuthClient(data: CreateOAuthClientRequest): Promise<OAuthClient> {
	return api.post('/admin/oauth-clients', data);
}

export async function updateOAuthClient(id: string, data: UpdateOAuthClientRequest): Promise<OAuthClient> {
	return api.put(`/admin/oauth-clients/${id}`, data);
}

export async function updateOAuthClientPublicKey(
	id: string,
	data: UpdateOAuthClientPublicKeyRequest
): Promise<OAuthClient> {
	return api.post(`/admin/oauth-clients/${id}/public-key`, data);
}

export async function deleteOAuthClient(id: string): Promise<ApiResponse> {
	return api.delete(`/admin/oauth-clients/${id}`);
}

export async function getJWKS(): Promise<JwksResponse> {
	return api.rawGet('/.well-known/jwks.json');
}

export async function introspectToken(token: string): Promise<OAuthIntrospectionResponse> {
	const body = new URLSearchParams();
	body.set('token', token);
	return api.rawPost('/oauth/introspect', body, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});
}

export async function requestMachineToken(data: {
	grant_type: string;
	client_id: string;
	audience: string;
	scope: string;
	client_assertion_type: string;
	client_assertion: string;
}): Promise<MachineTokenResponse> {
	const body = new URLSearchParams();
	for (const [key, value] of Object.entries(data)) {
		body.set(key, value);
	}
	return api.rawPost('/oauth/token', body, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});
}

export type { ApiKeyInfo };
