import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { FeedPage } from './feed.page';
import { AuthService } from '../../services/auth';
import { BookService } from '../../services/bookservice';

describe('FeedPage', () => {
  let component: FeedPage;
  let fixture: ComponentFixture<FeedPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { getUsuarioAtual: () => null } },
        { provide: BookService, useValue: { getBooksByGenre: () => Promise.resolve([]) } },
        { provide: Firestore, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
