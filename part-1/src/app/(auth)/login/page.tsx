"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { loginSchema, LoginFormData } from "@/schemas/auth";
import Link from "next/link";
import { useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toaster.create({
          title: "Login failed",
          description: "Invalid email or password",
          type: "error",
        });
      } else {
        toaster.create({
          title: "Login successful",
          description: "Redirecting...",
          type: "success",
        });
        
        // Redirect to root, middleware will handle role-based redirection
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "An error occurred",
        description: "Please try again later",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <Toaster />
      <Stack gap={8} align="center">
        <Heading size="2xl">Login</Heading>
        <Box w="full" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={4}>
              <Field label="Email" invalid={!!errors.email} errorText={errors.email?.message}>
                <Input {...register("email")} type="email" placeholder="Enter your email" />
              </Field>

              <Field label="Password" invalid={!!errors.password} errorText={errors.password?.message}>
                <Input {...register("password")} type="password" placeholder="Enter your password" />
              </Field>

              <Button type="submit" loading={isLoading} width="full" colorPalette="blue">
                Login
              </Button>
            </Stack>
          </form>
        </Box>
        <Text>
          Don't have an account?{" "}
          <ChakraLink asChild colorPalette="blue">
            <Link href="/signup">Sign up</Link>
          </ChakraLink>
        </Text>
      </Stack>
    </Container>
  );
}
