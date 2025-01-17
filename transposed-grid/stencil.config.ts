import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'transposed-grid',
  outputTargets: [
    // reactOutputTarget({
    //   componentCorePackage: 'transposed-grid',
    //   proxiesFile: '../transposed-grid-react/src/components/stencil-generated/index.ts',
    //   includeDefineCustomElements: true,
    // }),
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      buildDir: 'dist',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      buildDir: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  globalStyle: "src/global/variables.scss",
  plugins: [
    sass({
      includePaths: ['node_modules']
    }),
  ]
};
