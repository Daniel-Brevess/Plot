import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../services/auth';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user$: of(null)
          }
        }
      ]
    });
  });

  it('should redirect unauthenticated users to home', done => {
    const router = TestBed.inject(Router);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as never, {} as never);

      if (result instanceof UrlTree || typeof result === 'boolean') {
        fail('Expected an observable result.');
        return;
      }

      (result as ReturnType<typeof of>).subscribe(value => {
        expect(router.serializeUrl(value as UrlTree)).toBe('/home');
        done();
      });
    });
  });
});
