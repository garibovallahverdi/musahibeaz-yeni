'use client'
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/server/auth/client";
import { useRouter } from "next/navigation";
import Loading from "../../admin/_components/loading";
import Link from "next/link";

export default function Register() {


  const router = useRouter();

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading,setLoading] = useState(false)



  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
   e.preventDefault()
    try {

      await authClient.signUp.email(
        {
          email,
          name,
          password,
        },
        {
          onSuccess() {
            authClient.sendVerificationEmail(
              {
                email: email,
                callbackURL:window.location.origin+'/admin',
              },
              {
                onSuccess() {
                  router.push("/auth/login");
                },
                onError(message) {
                  toast.error(message.error.message);
                },
              }
            );
          },
          onError(message) {
            toast.error(message.error.message);
          },
        }
      );
    } catch (error) {
      toast.error("Qeydiyyat uğursuz oldu");
    } finally {
      setLoading(false);
    }
  };


    return (
      <>
  
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          {
            loading && <Loading/>
          }
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Image
              alt="Your Company"
              width={50}
              height={50}
              src={'/logo.png'}
              className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>
  
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={(e)=>onSubmit(e)} action="#" method="POST" className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                  Name
                </label>
                <div className="mt-2">
                  <input
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="block w-full rounded-md border bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="block w-full rounded-md border bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
  
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                    Password
                  </label>
                  <div className="text-sm">
                 
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md border bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                   Confirm Password
                  </label>
              
                </div>
                <div className="mt-2">
                  <input
                    id="confirmpassword"
                    value={confirmPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    name="confirmpassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="block w-full border rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
  
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>
  
            <p className="mt-10 text-center text-sm/6 text-gray-500">
              Already a member?{' '}
              <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Signin              
              </Link>
            </p>
          </div>
        </div>
      </>
    )
  }
  