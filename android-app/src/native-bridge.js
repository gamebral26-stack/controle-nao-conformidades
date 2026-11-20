import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const separator = result.indexOf(',');
      if (separator < 0) {
        reject(new Error('Could not encode the export file.'));
        return;
      }
      resolve(result.slice(separator + 1));
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read the export file.'));
    reader.readAsDataURL(blob);
  });
}

window.NcNativeBridge = {
  isNative: () => Capacitor.isNativePlatform(),

  async shareFile(filename, blob, title) {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('The Android file-sharing bridge is unavailable.');
    }

    const data = await blobToBase64(blob);
    const uniqueFilename = `nc-export-${Date.now()}-${filename}`;
    const { uri } = await Filesystem.writeFile({
      path: uniqueFilename,
      data,
      directory: Directory.Cache,
      recursive: true
    });

    await Share.share({
      title,
      dialogTitle: 'Salvar ou compartilhar arquivo',
      files: [uri]
    });
  }
};
