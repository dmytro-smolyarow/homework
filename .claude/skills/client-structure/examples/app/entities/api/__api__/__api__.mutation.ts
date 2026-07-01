'use client'

import { useMutation } from '@tanstack/react-query'

import { <api>CreateApi } from '@/app/entities/api/<api>/<api>.api'
import { I<Api>Body } from '@/app/entities/models/<api>.model'
import { <toast>Service } from '@/pkg/<theme>'

// <api> create hook
export const use<Api>CreateMutation = () => {
  return useMutation({
    mutationFn: (body: I<Api>Body) => <api>CreateApi(body),
    onError: (error: Error) => {
      <toast>Service.error(error.message)
    },
  })
}
