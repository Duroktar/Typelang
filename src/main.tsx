import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import confetti from 'canvas-confetti';
import lodash from 'lodash';
import * as zod from 'zod';
import { WasmCompilerProvider } from './lang/wasmCompiler';
import App from './App.tsx';
import './index.css';

// Expose NPM FFI packages globally for TypeLang runtime sandbox and interactive live preview
(window as any).confetti = confetti;
(window as any).lodash = lodash;
(window as any)._ = lodash;
(window as any).zod = zod;
(window as any).z = zod;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WasmCompilerProvider>
      <App />
    </WasmCompilerProvider>
  </StrictMode>,
);

