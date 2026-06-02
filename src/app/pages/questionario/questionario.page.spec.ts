import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { QuestionarioPage } from './questionario.page';
import { AuthService } from '../../services/auth';

describe('QuestionarioPage', () => {
  let component: QuestionarioPage;
  let fixture: ComponentFixture<QuestionarioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionarioPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getUsuarioAtual: () => null,
            salvarPreferencias: () => Promise.resolve()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
