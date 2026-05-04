// User
export interface User {
  id: string;
  email: string;
  name: string;
  githubId?: string;
  createdAt: Date;
}

// Project
export interface Project {
  id: string;
  name: string;
  repoUrl: string;
  framework: Framework;
  userId: string;
  createdAt: Date;
}

// Deployment
export interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  branch: string;
  commitSha: string;
  commitMessage: string;
  previewUrl: string;
  buildDuration?: number;
  aiErrorExplanation?: string;
  createdAt: Date;
}

// Log
export interface BuildLog {
  deploymentId: string;
  line: string;
  timestamp: Date;
}

// Enums
export type DeploymentStatus = 'queued' | 'building' | 'success' | 'failed';
export type Framework = 'react' | 'nextjs' | 'vue' | 'static' | 'unknown';
