"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  NativeSelect,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { signupSchema, SignupFormData } from "@/schemas/auth";
import { UserRole } from "@/types/auth";
import Link from "next/link";
import { useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.status !== "success") {
        throw new Error(responseData.message || "Registration failed");
      }

      toaster.create({
        title: "Account created",
        description: "Please login with your credentials",
        type: "success",
      });
      
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error(error);
      toaster.create({
        title: "Registration failed",
        description: error.message || "Please try again later",
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
        <Heading size="2xl">Sign Up</Heading>
        <Box w="full" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={4}>
              <Field label="Email" invalid={!!errors.email} errorText={errors.email?.message}>
                <Input {...register("email")} type="email" placeholder="Enter your email" />
              </Field>

              <Field label="Password" invalid={!!errors.password} errorText={errors.password?.message}>
                <Input {...register("password")} type="password" placeholder="Enter your password" />
              </Field>

              <Field label="Role" invalid={!!errors.role} errorText={errors.role?.message}>
                <NativeSelect.Root>
                  <NativeSelect.Field {...register("role")} placeholder="Select a role">
                    <option value={UserRole.OWNER}>Vehicle Owner</option>
                    <option value={UserRole.DRIVER}>Driver</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field>

              <Button type="submit" loading={isLoading} width="full" colorPalette="blue">
                Sign Up
              </Button>
            </Stack>
          </form>
        </Box>
        <Text>
          Already have an account?{" "}
          <ChakraLink asChild colorPalette="blue">
            <Link href="/login">Login</Link>
          </ChakraLink>
        </Text>
      </Stack>
    </Container>
  );
}
