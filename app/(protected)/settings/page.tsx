import { auth, signOut } from '@/auth';
import { LoginButton } from '@/components/auth/login-button';
import { GoogleSignInButton } from '@/components/auth/social';
import { Button } from '@/components/ui/button';

const page = async () => {
  const session = await auth();
  return (
    <div className='w-full flex flex-col'>
      <div className='w-full'>
        <p>{JSON.stringify(session)} </p>
      </div>
      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <button type='submit'> Sign Out</button>
      </form>
      <GoogleSignInButton />
      <LoginButton mode='modal' asChild>
        <Button variant='default' size='lg'>
          Sign in
        </Button>
      </LoginButton>
    </div>
  );
};

export default page;
