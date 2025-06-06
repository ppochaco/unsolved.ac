import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export const initInstance = (config: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    ...config,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...config.headers,
    },
  })

  return instance
}
