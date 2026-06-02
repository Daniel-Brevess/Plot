import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { EditProfilePage } from './edit-profile.page';
import { AuthService } from '../../services/auth';

describe('EditProfilePage', () => {
  let component: EditProfilePage;
  let fixture: ComponentFixture<EditProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfilePage, IonicModule.forRoot()],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getUsuarioAtual: () => null,
            atualizarPerfil: jasmine.createSpy('atualizarPerfil')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
