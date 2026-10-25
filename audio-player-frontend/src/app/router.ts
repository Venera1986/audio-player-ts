export type RouteName = 'login' | 'register' | 'tracks' | 'favorites' | 'profile';

const ROUTES = new Set<RouteName>([
  'login',
  'register',
  'tracks',
  'favorites',
  'profile',
]);

export function getCurrentRoute(): RouteName {
  const route = window.location.hash.replace('#/', '') as RouteName;

  return ROUTES.has(route) ? route : 'tracks';
}

export function navigate(route: RouteName): void {
  window.location.hash = `#/${route}`;
}
