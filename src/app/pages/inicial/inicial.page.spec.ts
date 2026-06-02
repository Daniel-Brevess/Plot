import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InicialPage } from './inicial.page';

describe('InicialPage', () => {
  let component: InicialPage;
  let fixture: ComponentFixture<InicialPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicialPage],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(InicialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
