import type { GraphQLClient } from './UserGraphQLRepository';

export function createGraphQLClient(endpoint?: string): GraphQLClient {
  if (endpoint) {
    return createFetchClient(endpoint);
  }
  return createMockGraphQLClient();
}

function createFetchClient(url: string): GraphQLClient {
  return {
    async request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
      if (!res.ok) throw new Error(`GraphQL error: ${res.status}`);
      const json = await res.json();
      if (json.errors?.length) throw new Error(json.errors[0]?.message ?? 'GraphQL error');
      return json.data as T;
    },
  };
}

/** Mock client: same User shape as example-react (id, name, email). */
function createMockGraphQLClient(): GraphQLClient {
  const mockUsers: { id: string; name: string; email: string }[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  return {
    async request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
      if (query.includes('users') && query.includes('GetUsers')) {
        return { users: [...mockUsers] } as T;
      }
      if (query.includes('user(id:') && variables?.id) {
        const u = mockUsers.find((x) => x.id === variables.id);
        return { user: u ?? null } as T;
      }
      if (query.includes('createUser') && variables) {
        const id = String(Date.now());
        const newUser = {
          id,
          name: String(variables.name ?? ''),
          email: String(variables.email ?? ''),
        };
        mockUsers.push(newUser);
        return { createUser: newUser } as T;
      }
      if (query.includes('updateUser') && variables?.id) {
        const index = mockUsers.findIndex((u) => u.id === variables.id);
        if (index === -1) return { updateUser: null } as T;
        mockUsers[index] = {
          ...mockUsers[index],
          ...(variables.name !== undefined && { name: String(variables.name) }),
          ...(variables.email !== undefined && { email: String(variables.email) }),
        };
        return { updateUser: mockUsers[index] } as T;
      }
      if (query.includes('deleteUser') && variables?.id) {
        const index = mockUsers.findIndex((u) => u.id === variables.id);
        if (index !== -1) mockUsers.splice(index, 1);
        return { deleteUser: true } as T;
      }
      return {} as T;
    },
  };
}
