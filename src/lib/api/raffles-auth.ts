import type {
  CloseRaffleResponse,
  CreateRaffleInput,
  CreateRaffleResponse,
  ParticipateResponse,
  UploadRequest,
  UploadResponse
} from '@/types/raffle'
import { authFetch } from './api-client'

export async function createRaffle(token: string, data: CreateRaffleInput) {
  return authFetch<CreateRaffleResponse>('/api/v1/raffles', token, {
    method: 'POST',
    body: data
  })
}

export async function participateInRaffle(token: string, raffleId: string) {
  return authFetch<ParticipateResponse>(
    `/api/v1/raffles/${raffleId}/participate`,
    token,
    {
      method: 'POST'
    }
  )
}

export async function closeRaffle(token: string, raffleId: string) {
  return authFetch<CloseRaffleResponse>(
    `/api/v1/raffles/${raffleId}/close`,
    token,
    {
      method: 'POST'
    }
  )
}

export async function getUploadUrl(token: string, data: UploadRequest) {
  return authFetch<UploadResponse>('/api/v1/assets/upload', token, {
    method: 'POST',
    body: data
  })
}

export async function uploadToS3(
  presignedUrl: string,
  file: File,
  contentType: string
): Promise<boolean> {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType
      },
      body: file
    })

    return response.ok
  } catch {
    return false
  }
}

export async function uploadImage(
  token: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const uploadUrlResponse = await getUploadUrl(token, {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  })

  if (!uploadUrlResponse.ok || !uploadUrlResponse.data) {
    return {
      url: null,
      error: uploadUrlResponse.error?.message || 'Failed to get upload URL'
    }
  }

  const { upload, file: fileInfo } = uploadUrlResponse.data
  const uploadSuccess = await uploadToS3(upload.url, file, file.type)

  if (!uploadSuccess) {
    return {
      url: null,
      error: 'Failed to upload image to S3'
    }
  }

  return {
    url: fileInfo.cloudFrontUrl,
    error: null
  }
}
