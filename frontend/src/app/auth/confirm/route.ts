import { type EmailOtpType, createClient } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

// import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  let errorMessage = 'Confirmation failed.'
  let confirmationError: {message: string} | null = null

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
    else {
      confirmationError = error
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/auth/error?error=' + errorMessage + (confirmationError ? ' ' + confirmationError.message : ''))
}
// import { createServerClient } from '@supabase/ssr'
// import { type EmailOtpType } from '@supabase/supabase-js'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url)

//   const token_hash = searchParams.get('token_hash')
//   const type = searchParams.get('type') as EmailOtpType | null
//   const next = searchParams.get('next') ?? '/'
  
//   let errorMessage = 'Confirmation failed.'

//   if(!token_hash) {
//     errorMessage += ' No token hash provided.'
//   }
//   if(!type) {
//     errorMessage += ' No type provided.'
//   } 

//   if (token_hash && type) {
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll: async () => {
//             const cookieStore = await cookies()
//             return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
//           },
//           setAll: async (cookiesToSet) => {
//             const cookieStore = await cookies()
//             cookiesToSet.forEach(({ name, value, options }) => {
//               cookieStore.set(name, value, options)
//             })
//           },
//         },
//       }
//     )

//     const { error } = await supabase.auth.verifyOtp({
//       type,
//       token_hash,
//     })
//     if (!error) {
//       return NextResponse.redirect(new URL(`/${next.slice(1)}`, request.url))
//     }
//     else {
//         errorMessage = error.message
//     }
//   }

//   // return the user to an error page with some instructions
//   return NextResponse.redirect(new URL('/auth/error?error=' + errorMessage, request.url))
// }
