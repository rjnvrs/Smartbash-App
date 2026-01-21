"use client";

import Header from "../../components/core-ui/login-components/header";
import FormContainer from "../../components/core-ui/login-components/FormContainer";
import SignInForm from "../../components/core-ui/login-components/SignInForm";

export default function page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex items-center justify-center p-8 px-50 py-20">
        <FormContainer>
          <SignInForm />
        </FormContainer>
      </div>
    </div>
  );
}
