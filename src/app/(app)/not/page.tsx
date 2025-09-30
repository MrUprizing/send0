"use client";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { api } from "../../../../convex/_generated/api";

function App() {
  return (
    <main>
      <Unauthenticated>Logged out</Unauthenticated>
      <Authenticated>
        Logged in
        <Content />
      </Authenticated>
      <AuthLoading>Loading...</AuthLoading>
    </main>
  );
}

const Content = () => {
  const messages = useQuery(api.auth.getCurrentUser);
  return <div>Authenticated content: {messages?._id}</div>;
};

export default App;
