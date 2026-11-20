const fs = require('node:fs/promises');
const path = require('node:path');
const { build } = require('esbuild');

const appRoot = path.resolve(__dirname, '..');
const webRoot = path.resolve(appRoot, '..');
const outputRoot = path.join(appRoot, 'www');
const webFiles = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

async function copyWebFiles() {
  await fs.mkdir(outputRoot, { recursive: true });

  for (const file of webFiles) {
    await fs.copyFile(path.join(webRoot, file), path.join(outputRoot, file));
  }

  const indexPath = path.join(outputRoot, 'index.html');
  const indexHtml = await fs.readFile(indexPath, 'utf8');
  const replacements = [
    [
      '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>',
      '<script src="./vendor/chart.umd.js"></script>'
    ],
    [
      '<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>',
      '<script src="./vendor/xlsx.full.min.js"></script>'
    ],
    [
      '<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>',
      '<script src="./vendor/tesseract.min.js"></script>'
    ],
    [
      "Tesseract.createWorker('por+eng', 1, {",
      "Tesseract.createWorker('por+eng', 1, {\n      workerPath: './vendor/worker.min.js',\n      langPath: './vendor/tessdata',\n      corePath: './vendor/tesseract-core',"
    ],
    [
      "if ('serviceWorker' in navigator && location.protocol !== 'file:') {",
      "if ('serviceWorker' in navigator && location.protocol !== 'file:' && location.hostname !== 'localhost') {"
    ]
  ];

  let nativeHtml = indexHtml;
  for (const [source, replacement] of replacements) {
    if (!nativeHtml.includes(source)) {
      throw new Error(`Could not apply native HTML replacement: ${source}`);
    }
    nativeHtml = nativeHtml.replace(source, replacement);
  }
  if (!nativeHtml.includes('</body>')) {
    throw new Error('Could not inject the Android bridge into index.html.');
  }
  nativeHtml = nativeHtml.replace(
    '</body>',
    '<script src="./native-bridge.js"></script></body>'
  );
  await fs.writeFile(indexPath, nativeHtml, 'utf8');

  await fs.mkdir(path.join(outputRoot, 'vendor'), { recursive: true });
  await fs.copyFile(
    path.join(appRoot, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'),
    path.join(outputRoot, 'vendor', 'chart.umd.js')
  );
  await fs.copyFile(
    path.join(appRoot, 'vendor', 'xlsx.full.min.js'),
    path.join(outputRoot, 'vendor', 'xlsx.full.min.js')
  );
  await fs.copyFile(
    path.join(appRoot, 'node_modules', 'tesseract.js', 'dist', 'tesseract.min.js'),
    path.join(outputRoot, 'vendor', 'tesseract.min.js')
  );
  await fs.copyFile(
    path.join(appRoot, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
    path.join(outputRoot, 'vendor', 'worker.min.js')
  );

  const coreRoot = path.join(appRoot, 'node_modules', 'tesseract.js-core');
  const coreOutput = path.join(outputRoot, 'vendor', 'tesseract-core');
  await fs.mkdir(coreOutput, { recursive: true });
  for (const file of [
    'tesseract-core.wasm.js',
    'tesseract-core-simd.wasm.js',
    'tesseract-core-lstm.wasm.js',
    'tesseract-core-simd-lstm.wasm.js',
    'tesseract-core.wasm',
    'tesseract-core-simd.wasm',
    'tesseract-core-lstm.wasm',
    'tesseract-core-simd-lstm.wasm'
  ]) {
    await fs.copyFile(path.join(coreRoot, file), path.join(coreOutput, file));
  }

  const tessdataOutput = path.join(outputRoot, 'vendor', 'tessdata');
  await fs.mkdir(tessdataOutput, { recursive: true });
  for (const language of ['eng', 'por']) {
    await fs.copyFile(
      path.join(
        appRoot,
        'node_modules',
        '@tesseract.js-data',
        language,
        '4.0.0_best_int',
        `${language}.traineddata.gz`
      ),
      path.join(tessdataOutput, `${language}.traineddata.gz`)
    );
  }

  const licensesOutput = path.join(outputRoot, 'licenses');
  await fs.mkdir(licensesOutput, { recursive: true });
  const licenseFiles = [
    ['node_modules/@capacitor/android/LICENSE', 'Capacitor-Android-LICENSE.txt'],
    ['node_modules/@capacitor/core/LICENSE', 'Capacitor-Core-LICENSE.txt'],
    ['node_modules/@capacitor/filesystem/LICENSE', 'Capacitor-Filesystem-LICENSE.txt'],
    ['node_modules/@capacitor/share/LICENSE', 'Capacitor-Share-LICENSE.txt'],
    ['node_modules/chart.js/LICENSE.md', 'Chart.js-LICENSE.txt'],
    ['node_modules/tesseract.js/LICENSE.md', 'Tesseract.js-LICENSE.txt'],
    ['node_modules/tesseract.js-core/LICENSE', 'Tesseract.js-core-LICENSE.txt'],
    ['vendor/SheetJS-LICENSE.txt', 'SheetJS-LICENSE.txt']
  ];
  for (const [source, destination] of licenseFiles) {
    await fs.copyFile(
      path.join(appRoot, source),
      path.join(licensesOutput, destination)
    );
  }
  await fs.copyFile(
    path.join(appRoot, 'THIRD_PARTY_NOTICES.md'),
    path.join(outputRoot, 'THIRD_PARTY_NOTICES.md')
  );

  await build({
    entryPoints: [path.join(appRoot, 'src', 'native-bridge.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome90',
    outfile: path.join(outputRoot, 'native-bridge.js')
  });
}

copyWebFiles().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
