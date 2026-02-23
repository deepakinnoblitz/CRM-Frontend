import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  assetsDir: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Innoblitz CRM',
  appVersion: packageJson.version,
  assetsDir: import.meta.env.PROD ? '/assets/company/crm/assets' : '/assets',
};
