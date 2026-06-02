import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SobrePage } from './sobre.page';

describe('SobrePage', () => {
  let component: SobrePage;
  let fixture: ComponentFixture<SobrePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobrePage],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SobrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
