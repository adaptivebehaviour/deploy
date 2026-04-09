// "use client";

import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function signUp(creds: { email: string; password: string }) {
    return await supabase.auth.signUp({
        email: creds.email,
        password: creds.password
      })
}

export async function signIn(creds: { email: string; password: string }) {
    return await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
    })
}

export async function requestPasswordReset(email: string) {
    return await supabase.auth.resetPasswordForEmail(email)
}

export async function updatePassword(password: string) {
    return await supabase.auth.updateUser({
        password: password
    })
}

export async function signOut() {
    return await supabase.auth.signOut()
}



// export function SignUpError(error)
// {
//     const { message } = error
//     return message
// }