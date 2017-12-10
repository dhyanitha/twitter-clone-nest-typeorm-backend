import { Guard, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

@Guard()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) { }

  canActivate(request: any, context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log(this.authService);
    console.log(request);
    return true;
  }
}
