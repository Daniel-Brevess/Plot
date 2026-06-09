import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/feed/feed.page').then(m => m.FeedPage),
  },
  {
    path: 'explore',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/explore/explore.page').then(m => m.ExplorePage),
  },
  {
    path: 'books/:workId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/book-detail/book-detail.page').then(m => m.BookDetailPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
  {
    path: 'edit-profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/edit-profile/edit-profile.page').then(m => m.EditProfilePage),
  },
  {
    path: 'questionario',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/questionario/questionario.page').then( m => m.QuestionarioPage)
  },
  {
    path: 'inicial',
    loadComponent: () => import('./pages/inicial/inicial.page').then( m => m.InicialPage)
  },
  {
    path: 'sobre',
    loadComponent: () => import('./sobre/sobre.page').then( m => m.SobrePage)
  },
];
