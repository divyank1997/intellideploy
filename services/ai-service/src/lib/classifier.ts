export type ErrorType =
  | 'dependency'
  | 'memory'
  | 'typescript'
  | 'missing-env'
  | 'framework-nextjs'
  | 'framework-react'
  | 'framework-vue'
  | 'general';

interface ClassificationRule {
  type: ErrorType;
  patterns: RegExp[];
}

const RULES: ClassificationRule[] = [
  {
    type: 'memory',
    patterns: [
      /FATAL ERROR.*heap/i,
      /Allocation failed/i,
      /exit code 137/i,
      /JavaScript heap out of memory/i,
    ],
  },
  {
    type: 'missing-env',
    patterns: [
      /process\.env\.\w+ is undefined/i,
      /Missing.*env/i,
      /NEXT_PUBLIC_\w+ is not defined/i,
      /import\.meta\.env\.\w+ is undefined/i,
    ],
  },
  {
    type: 'dependency',
    patterns: [
      /ERESOLVE/i,
      /peer dep missing/i,
      /Cannot find module/i,
      /npm error 404/i,
      /EINTEGRITY/i,
      /Missing script/i,
    ],
  },
  {
    type: 'typescript',
    patterns: [
      /error TS\d+/i,
      /TypeScript.*error/i,
      /is not assignable to type/i,
      /Property .* does not exist/i,
      /implicitly has an .any. type/i,
    ],
  },
  {
    type: 'framework-nextjs',
    patterns: [
      /next build/i,
      /next\/font/i,
      /generateStaticParams/i,
      /next\.config/i,
      /"app" and "pages"/i,
    ],
  },
  {
    type: 'framework-react',
    patterns: [
      /react-scripts/i,
      /Create React App/i,
      /react-dom/i,
      /CI=true.*warnings/i,
    ],
  },
  {
    type: 'framework-vue',
    patterns: [
      /vue-cli-service/i,
      /vite:vue/i,
      /@vue\//i,
    ],
  },
];

export function classifyError(logs: string): ErrorType {
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(logs))) {
      return rule.type;
    }
  }
  return 'general';
}
