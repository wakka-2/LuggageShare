import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '@/lib/api';

interface UploadOptions {
  folder?: string;
  source?: 'library' | 'camera';
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickAndUpload = async (options: UploadOptions = {}): Promise<string | null> => {
    const { folder = 'general', source = 'library' } = options;

    try {
      setError(null);

      // Request permissions
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          setError('Camera permission is required');
          return null;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          setError('Photo library permission is required');
          return null;
        }
      }

      // Launch picker
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: true,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: true,
            });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      const asset = result.assets[0];
      setIsUploading(true);

      // Build FormData
      const formData = new FormData();
      const uri = asset.uri;
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

      formData.append('file', {
        uri,
        name: filename,
        type: mimeType,
      } as any);

      // Upload
      const { data } = await apiClient.post(`/uploads/image?folder=${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = data?.url || data?.data?.url;
      setUploadedUrl(url);
      return url;
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Upload failed';
      setError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setUploadedUrl(null);
    setError(null);
  };

  return { pickAndUpload, isUploading, uploadedUrl, error, reset };
}
