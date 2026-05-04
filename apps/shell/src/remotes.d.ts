declare module 'mfe_deployments/DeploymentsList' {
  import React from 'react';
  const DeploymentsList: React.ComponentType<{ token?: string }>;
  export default DeploymentsList;
}

declare module 'mfe_ui/Button' {
  import React from 'react';
  export const Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger'; loading?: boolean }>;
}

declare module 'mfe_ui/Card' {
  import React from 'react';
  export const Card: React.ComponentType<{ title?: string; children: React.ReactNode }>;
}

declare module 'mfe_ui/Badge' {
  import React from 'react';
  export const Badge: React.ComponentType<{ status: 'queued' | 'building' | 'success' | 'failed'; children: React.ReactNode }>;
}
