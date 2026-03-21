import { supabase } from "./supabaseClient";

const BUCKETS = {
  kyc:    "kyc-documents",
  farmer: "farmer-documents",
};

export async function uploadFile(file, bucket, userId, fileLabel) {
  const ext      = file.name.split(".").pop();
  const filename = `${Date.now()}-${fileLabel}.${ext}`;
  const path     = `${userId}/${filename}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert:       false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(uploadData.path ?? path);

  if (!urlData?.publicUrl) {
    throw new Error("Could not get file URL after upload");
  }

  return urlData.publicUrl;
}

export async function uploadMultipleFiles(files, bucket, userId, label) {
  const urls = await Promise.all(
    files.map((file, i) =>
      uploadFile(file, bucket, userId, `${label}-${i + 1}`)
    )
  );
  return urls.join(",");
}

export const uploadKycFile    = (file, userId, label) =>
  uploadFile(file, BUCKETS.kyc, userId, label);

export const uploadFarmerFile = (file, userId, label) =>
  uploadFile(file, BUCKETS.farmer, userId, label);

export const uploadFarmerPhotos = (files, userId) =>
  uploadMultipleFiles(files, BUCKETS.farmer, userId, "land-photo");