import { Component } from '@angular/core';
import { container } from '@caf/core/container';
import { TYPES } from '@caf/core/ports';
import type { ILoginUseCase } from '@caf/example-domain';
import { Login } from '@caf/example-domain';

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
