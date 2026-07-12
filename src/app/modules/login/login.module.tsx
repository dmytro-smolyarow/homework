'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FC, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import { OAuthSignIn } from '@/app/features/oauth-sign-in'
import { signIn } from '@/pkg/auth/auth-client'

interface ILoginForm {
  email: string
  password: string
}

// interface
interface IProps {
  redirectTo: string
}

// component
const LoginModule: FC<Readonly<IProps>> = (props) => {
  const { redirectTo } = props

  const router = useRouter()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginForm>()

  // sign in — surface Better Auth errors, then refresh session-aware UI
  const onSubmit = async (values: ILoginForm) => {
    setServerError(null)
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError(error.message ?? 'Invalid email or password')
      return
    }

    queryClient.invalidateQueries()
    router.push(redirectTo)
    router.refresh()
  }

  // return
  return (
    <div className='auth-card'>
      <h1 style={{ marginTop: 0 }}>Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='field'>
          <label htmlFor='email'>Email</label>
          <input
            id='email'
            className='input'
            type='email'
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />
          {errors.email && <span className='error'>{errors.email.message}</span>}
        </div>

        <div className='field'>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            className='input'
            type='password'
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
          />
          {errors.password && <span className='error'>{errors.password.message}</span>}
        </div>

        {serverError && <p className='error'>{serverError}</p>}

        <button className='btn primary' type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <OAuthSignIn redirectTo={redirectTo} />
      <p className='muted' style={{ marginTop: 16 }}>
        No account? <Link href='/register'>Sign up</Link>
      </p>
    </div>
  )
}

export default LoginModule
