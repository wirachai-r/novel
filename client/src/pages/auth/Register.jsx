import React from 'react'
import RegisterForm from "@/components/auth/register-form"

const Register = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <RegisterForm />
      </div>
    </div>
  )
}

export default Register