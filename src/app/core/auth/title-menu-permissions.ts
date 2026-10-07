/**
 * UMS returns menu/submenu names separately and grants their VIEW permissions
 * as `<menu-or-submenu-name>_VIEW`. Keep these names identical to `app.menus`
 * in the fetch-internal-permissions response.
 */

const viewPermission = <T extends string>(menuName: T) =>
  [`${menuName}_VIEW`] as const;

export const TITLE_MENU_PERMISSIONS = {
  invoice: {
    group: viewPermission('TITLE_INVOICE'),
    uploadTitles: viewPermission('TITLE_INVOICE_UPLOAD_TITLES'),
    viewTitles: viewPermission('TITLE_INVOICE_VIEW_TITLES'),
    multipleInvoice: ['TITLE_INVOICE_MULTIPLE_INVOICE_VIEW'] as const,
    editTitles: ['TITLE_INVOICE_VIEW_TITLES_EDIT'] as const,
    overview: viewPermission('TITLE_INVOICE_OVERVIEW')
  },
  publication: {
    group: viewPermission('TITLE_PUBLICATION'),
    viewTitles: viewPermission('TITLE_PUBLICATION_VIEW_TITLES'),
    editTitles: ['TITLE_PUBLICATION_VIEW_TITLES_EDIT'] as const,
    overview: viewPermission('TITLE_PUBLICATION_OVERVIEW'),
    modifiedTitles: viewPermission('TITLE_PUBLICATION_VIEW_MODIFIED_TITLES'),
    validateAndUpload: viewPermission('TITLE_PUBLICATION_UPLOAD_TITLES')
  }
} as const;
