"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Link as ChakraLink,
  NativeSelect,
  Flex,
  VStack,
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
    } catch (error: unknown) {
      console.error(error);
      toaster.create({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again later",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      _dark={{ bg: "black" }}
      p={4}
    >
      <Toaster />
      <Box
        w="full"
        maxW="md"
        bg="white"
        _dark={{
          bg: "gray.900",
          borderColor: "gray.800",
        }}
        rounded="2xl"
        shadow="xl"
        p={{ base: 6, md: 10 }}
        borderWidth="1px"
        borderColor="gray.100"
      >
        <VStack gap={8} align="stretch">
          <VStack gap={2} textAlign="center">
            <Heading
              size="3xl"
              letterSpacing="tight"
              _dark={{ color: "white" }}
            >
              Create Account
            </Heading>
            <Text
              color="gray.500"
              fontSize="md"
              _dark={{ color: "gray.400" }}
            >
              Join us to manage your fleet efficiently
            </Text>
          </VStack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={5}>
              <Field
                label="Email"
                invalid={!!errors.email}
                errorText={errors.email?.message}
              >
                <Input
                  {...register("email")}
                  size="lg"
                  type="email"
                  placeholder="name@example.com"
                  variant="subtle"
                  _dark={{
                    bg: "gray.800",
                    color: "white",
                    borderColor: "transparent",
                    _focus: { borderColor: "blue.500", bg: "gray.800" },
                    _placeholder: { color: "gray.500" },
                  }}
                />
              </Field>

              <Field
                label="Password"
                invalid={!!errors.password}
                errorText={errors.password?.message}
              >
                <Input
                  {...register("password")}
                  size="lg"
                  type="password"
                  placeholder="Create a password"
                  variant="subtle"
                  _dark={{
                    bg: "gray.800",
                    color: "white",
                    borderColor: "transparent",
                    _focus: { borderColor: "blue.500", bg: "gray.800" },
                    _placeholder: { color: "gray.500" },
                  }}
                />
              </Field>

              <Field
                label="Role"
                invalid={!!errors.role}
                errorText={errors.role?.message}
              >
                <NativeSelect.Root size="lg" variant="subtle">
                  <NativeSelect.Field
                    {...register("role")}
                    placeholder="Select a role"
                    _dark={{
                      bg: "gray.800",
                      color: "white",
                      borderColor: "transparent",
                      _focus: { borderColor: "blue.500", bg: "gray.800" },
                    }}
                  >
                    <option value={UserRole.OWNER}>Vehicle Owner</option>
                    <option value={UserRole.DRIVER}>Driver</option>
                    <option value={UserRole.CUSTOMER}>Customer</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field>

              <Button
                type="submit"
                loading={isLoading}
                width="full"
                size="lg"
                colorPalette="blue"
                fontWeight="bold"
                mt={2}
                _dark={{
                  color: "white",
                  _hover: { bg: "blue.600" },
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </form>

          <Text
            textAlign="center"
            fontSize="sm"
            color="gray.500"
            _dark={{ color: "gray.400" }}
          >
            Already have an account?{" "}
            <ChakraLink asChild colorPalette="blue" fontWeight="semibold">
              <Link href="/login">Login</Link>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}