'use server';

import { LoginSchema } from '@/lib/schemas';
import { z } from 'zod';
import { signIn } from '@/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
  console.log('LOGS FROM LOGIN FUNC');
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, code } = validatedFields.data;
  console.log(email, password);
  try {
    await signIn('credentials', {
      email,
      password,
      //redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT  -- for callbacks, to be redirected to old page before login
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    console.log({ error });
    if (error instanceof AuthError) {
      console.log(error.type, error.message);
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Wrong email or password.' };
        case 'OAuthAccountNotLinked':
          return { error: 'OAuthAccountNotLinked.' };
        default:
          return { error: 'Oops! Something went wrong..' };
      }
    }
    throw error;
  }

  //await new Promise((resolve) => setTimeout(resolve, 3000));
  return { success: 'Confirmation email sent!' };

  /*const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Email does not exist!' };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { success: 'Confirmation email sent!' };
  } */
};
