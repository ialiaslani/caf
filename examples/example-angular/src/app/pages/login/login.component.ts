import { Component } from '@angular/core';
import { container } from '@c.a.f/core/container';
import { TYPES } from '@c.a.f/core/ports';
import type { ILoginUseCase } from '@c.a.f/example-domain';
import { Login } from '@c.a.f/example-domain';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  private loginUseCase: ILoginUseCase;

  constructor() {
    this.loginUseCase = container.get<ILoginUseCase>(TYPES.LoginUseCase);
  }

  async login() {
    try {
      await this.loginUseCase.execute(
        new Login(this.username, this.password)
      );
      alert('Login successful!');
    } catch (error) {
      alert('Login failed!');
    }
  }
}
