import type { IUserRepository, User } from '../../domain';

export interface GraphQLClient {
  request<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T>;
}

const GET_USERS = `
  query GetUsers {
    users { id name email }
  }
`;

const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) { id name email }
  }
`;

const CREATE_USER = `
  mutation CreateUser($name: String!, $email: String!) {
    createUser(input: { name: $name, email: $email }) { id name email }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $name: String, $email: String) {
    updateUser(id: $id, input: { name: $name, email: $email }) { id name email }
  }
`;

const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

/**
 * UserGraphQLRepository implements IUserRepository using GraphQL.
 * Same domain/application as example-react; only infrastructure differs (GraphQL instead of REST).
 */
export class UserGraphQLRepository implements IUserRepository {
  constructor(private client: GraphQLClient) {}

  async getUsers(): Promise<User[]> {
    const data = await this.client.request<{ users: User[] }>(GET_USERS);
    return data?.users ?? [];
  }

  async getUserById(id: string): Promise<User> {
    const data = await this.client.request<{ user: User | null }>(GET_USER, { id });
    const u = data?.user;
    if (!u) throw new Error(`User not found: ${id}`);
    return u;
  }

  async createUser(user: User): Promise<User> {
    const data = await this.client.request<{ createUser: User }>(CREATE_USER, {
      name: user.name,
      email: user.email,
    });
    const added = data?.createUser;
    if (!added) throw new Error('CreateUser mutation returned no data');
    return added;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const data = await this.client.request<{ updateUser: User }>(UPDATE_USER, {
      id,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
    });
    const updated = data?.updateUser;
    if (!updated) throw new Error('UpdateUser mutation returned no data');
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.request<{ deleteUser: unknown }>(DELETE_USER, { id });
  }
}
