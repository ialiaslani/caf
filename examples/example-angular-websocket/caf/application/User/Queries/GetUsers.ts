import { type UseCase, type RequestResult, pulse } from '@c.a.f/core';
import type { User } from '../../../domain';
import { UserService } from '../../../domain';

export class GetUsers implements UseCase<[], User[]> {
  constructor(private userService: UserService) {}

  async execute(): Promise<RequestResult<User[]>> {
    try {
      const users = await this.userService.getUsers();
      return {
        loading: pulse(false),
        data: pulse(users),
        error: pulse(null! as Error),
      };
    } catch (error) {
      return {
        loading: pulse(false),
        data: pulse([]),
        error: pulse(error as Error),
      };
    }
  }
}
