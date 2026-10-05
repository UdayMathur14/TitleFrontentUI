import { TITLE_MENU_PERMISSIONS } from './title-menu-permissions';

export const TITLE_ROUTE_ACCESS = [
  { path: '/dashboard', permissions: TITLE_MENU_PERMISSIONS.invoice.overview },
  { path: '/titles', permissions: TITLE_MENU_PERMISSIONS.invoice.viewTitles },
  { path: '/titles/multiple-invoice', permissions: TITLE_MENU_PERMISSIONS.invoice.viewTitles },
  { path: '/titles/upload', permissions: TITLE_MENU_PERMISSIONS.invoice.uploadTitles },
  { path: '/publications/overview', permissions: TITLE_MENU_PERMISSIONS.publication.overview },
  { path: '/publications', permissions: TITLE_MENU_PERMISSIONS.publication.validateAndUpload },
  { path: '/publications/records', permissions: TITLE_MENU_PERMISSIONS.publication.viewTitles },
  { path: '/publications/modified', permissions: TITLE_MENU_PERMISSIONS.publication.modifiedTitles }
] as const;
